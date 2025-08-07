import { config } from '@/config'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { Adapter } from '@/domain/types'
import { IModel } from '@/domain/entity/model'
import { InternalError, InvalidDataError, NotFoundError, TimeoutError } from '@/domain/errors'
import { ModelService } from '@/domain/service/model'

type Params = Pick<Adapter, 'openrouterGateway'> & {
  modelService: ModelService
}

type SendWithFallback = (params: {
  fallbacks: IModel[]
  settings: {
    system_prompt: string
  }
  messages: {
    role: 'user' | 'assistant'
    content: string
  }[]
  response_format?: Parameters<Adapter['openrouterGateway']['sync']>[0]['response_format']
  endUserId: string
}) => Promise<{
  result: Awaited<ReturnType<Params['openrouterGateway']['sync']>>
  model: IModel
  caps: number
}>

export const buildSendWithFallback = ({
  openrouterGateway,
  modelService,
}: Params): SendWithFallback => {
  const timeoutMs = config.timeouts.web_search

  return async ({ fallbacks, ...params }) => {
    let timeoutId: NodeJS.Timeout
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new TimeoutError())
      }, timeoutMs)
    })

    const localFallbacks = [...fallbacks]

    let model: IModel | undefined
    const send = async () => {
      model = localFallbacks.shift()

      if (!model) {
        throw new NotFoundError({
          code: 'NO_FALLBACK_MODELS_LEFT',
        })
      }

      const contextLength = await modelService.tokenize({
        model: model,
        messages: [
          {
            role: 'user',
            content: params.settings.system_prompt ?? '',
          },
          ...params.messages,
        ],
      })

      if (contextLength > model.context_length) {
        throw new InvalidDataError({
          code: 'CONTEXT_LENGTH_EXCEEDED',
          message: `Context length exceeded. Context length: ${contextLength}, ${model.id} context length: ${model.context_length}`,
        })
      }

      const result = await openrouterGateway.sync({
        ...params,
        settings: {
          system_prompt: params.settings.system_prompt,
          model: `${model.prefix}${model.id}`,
        },
      })

      if (!result.usage) {
        logger.error({
          location: 'sendWithFallback',
          message: 'Unable to correctly calculate usage',
          model_id: model.id,
        })
        throw new InternalError({
          code: 'UNABLE_TO_CALCULATE_USAGE',
          message: 'Unable to correctly calculate usage',
        })
      }

      const caps = await modelService.getCaps.text({
        model,
        usage: result.usage,
      })

      return {
        result,
        model,
        caps,
      }
    }

    while (localFallbacks.length > 0) {
      try {
        return await Promise.race([send(), timeout]).then((result) => {
          clearTimeout(timeoutId)
          return result
        })
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw error
        }

        logger.error({
          location: `sendWithFallback`,
          message: getErrorString(error),
          modelId: model?.id,
        })
        if (localFallbacks.length === 0) {
          throw error
        }
      }
    }

    throw new NotFoundError({
      code: 'NO_FALLBACK_MODELS_LEFT',
    })
  }
}
