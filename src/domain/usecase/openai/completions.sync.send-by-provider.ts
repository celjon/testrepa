import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { config } from '@/config'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import {
  hasOpenrouterParams,
  IModelProvider,
  isOpenAIProvider,
  isOpenRouterProvider,
} from '@/domain/entity/model-provider'
import { IModel } from '@/domain/entity/model'
import { IUser } from '@/domain/entity/user'
import { UseCaseParams } from '../types'
import { ModelUsage } from '@/adapter/gateway/types'

type Params = UseCaseParams

export type SendTextByProvider = (params: {
  providerId: string | null
  model: IModel
  apiParams: {
    messages: Array<ChatCompletionMessageParam>
    [key: string]: unknown
  }
  user: Pick<IUser, 'id'> & Partial<Pick<IUser, 'email'>>
}) => Promise<{
  result: {
    response: ChatCompletion
    usage: ModelUsage | null
  }
  provider_id: string
}>

export type SendTextByFallbackProvider = (params: {
  provider: IModelProvider
  error: unknown
  model: IModel
  apiParams: {
    messages: Array<ChatCompletionMessageParam>
    [key: string]: unknown
  }
  user: Pick<IUser, 'id'> & Partial<Pick<IUser, 'email'>>
}) => Promise<{
  result: {
    response: ChatCompletion
    usage: ModelUsage | null
  }
  provider_id: string
}>

export const buildSendSyncTextByProvider = ({ adapter, service }: Params) => {
  const { openaiGateway, openrouterGateway, modelProviderRepository } = adapter

  const sendByProvider: SendTextByProvider = async ({
    providerId,
    model,
    user,
    apiParams,
    ...params
  }) => {
    if (!providerId) {
      const defaultProvider = await service.model.getDefaultProvider({
        model,
        excludedProviders: [config.model_providers.g4f.id],
      })

      if (!defaultProvider) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_PROVIDER_NOT_FOUND',
          message: `Default model provider not found for model ${model.id}`,
        })
      }

      providerId = defaultProvider.id
    }

    const provider = await modelProviderRepository.get({
      where: {
        id: providerId,
        models: { some: { id: model.id } },
      },
      orderBy: { order: 'asc' },
      include: {
        fallback: {
          select: {
            id: true,
            name: true,
            disabled: true,
          },
        },
      },
    })

    if (!provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND',
        message: `Model provider not found for model ${model.id}`,
      })
    }
    if (provider.disabled && !provider.fallback_id) {
      throw new ForbiddenError({
        code: 'MODEL_PROVIDER_DISABLED',
      })
    }
    if (provider.disabled && provider.fallback_id) {
      return sendByProvider({
        providerId: provider.fallback_id,
        model,
        user,
        apiParams,
        ...params,
      })
    }

    try {
      const isOpenrouterRequest = hasOpenrouterParams(apiParams)

      if (isOpenAIProvider(provider) && !isOpenrouterRequest) {
        const result = await openaiGateway.raw.completions.create.sync({
          ...apiParams,
          model: model.id,
        })

        return {
          result,
          provider_id: provider.id,
        }
      } else if (isOpenrouterRequest || isOpenRouterProvider(provider)) {
        const result = await openrouterGateway.raw.completions.create.sync({
          middleOut: true,
          ...apiParams,
          model: model.prefix + model.id,
          endUserId: user.id,
        })

        return {
          result,
          provider_id: config.model_providers.openrouter.id,
        }
      } else {
        throw new ForbiddenError({
          code: 'MODEL_PROVIDER_NOT_SUPPORTED',
        })
      }
    } catch (error) {
      return sendByFallback({
        provider,
        error,
        model,
        user,
        apiParams,
        ...params,
      })
    }
  }

  const sendByFallback = buildSendByFallback({
    sendByProvider,
  })

  return sendByProvider
}

const buildSendByFallback = ({
  sendByProvider,
}: {
  sendByProvider: SendTextByProvider
}): SendTextByFallbackProvider => {
  return async ({ provider, model, error, user, ...params }) => {
    const errorString = getErrorString(error)
    if (
      errorString.includes('context_length_exceeded') ||
      errorString.includes('maximum context length') ||
      errorString.includes('input length and `max_tokens` exceed context limit') ||
      errorString.includes('exceeds the maximum number of tokens allowed') ||
      errorString.includes('Input is too long for requested model') ||
      errorString.includes('`inputs` tokens + `max_new_tokens` must be')
    ) {
      throw error
    }

    const logEntry = {
      message: getErrorString(error),
      provider: provider.name,
      model: model.id,
      providerFallback: provider.fallback?.name ?? null,
      user: user.email ?? user.id,
    }

    if (!provider.fallback || provider.fallback.disabled) {
      logger.error({
        ...logEntry,
        location: 'completions.sync.sendByFallback.noFallback',
      })

      throw error
    }

    logger.warn({
      ...logEntry,
      location: 'completions.sync.sendByFallback',
    })

    try {
      return await sendByProvider({
        providerId: provider.fallback_id,
        model,
        user,
        ...params,
      })
    } catch (e) {
      logger.error({
        location: `completions.sync.sendByFallback.fallbackFailed`,
        message: getErrorString(e),
        fallback_id: provider.fallback_id,
      })

      throw error
    }
  }
}
