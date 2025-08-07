import { logger } from '@/lib/logger'
import { Adapter } from '@/adapter'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { IChatImageSettings } from '@/domain/entity/chat-settings'
import { IModelProvider, isG4FProvider, isOpenAIProvider } from '@/domain/entity/model-provider'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IModel } from '@/domain/entity/model'
import { ImageLLMPricingParams } from '../../model/pricing-schemas'

type Params = Adapter & {
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
}

type Image = {
  base64: string
  buffer: Buffer
  ext: string
}

export type SendImageByProvider = (params: {
  providerId: string | null
  model: IModel
  message: IMessage
  settings: Partial<IChatImageSettings>
  endUserId: string
}) => Promise<{
  images: Image[]
  usage: ImageLLMPricingParams | null
  provider_id: string
}>

export type SendImageByFallbackProvider = (params: {
  provider: IModelProvider
  model: IModel
  error: unknown
  message: IMessage
  settings: Partial<IChatImageSettings>
  endUserId: string
}) => Promise<{
  images: Image[]
  usage: ImageLLMPricingParams | null
  provider_id: string
}>

export const buildSendImageByProvider = ({
  dalleGateway,
  g4fGateway,
  modelProviderRepository,
  modelService,
}: Params) => {
  const sendByProvider: SendImageByProvider = async ({ providerId, model, ...params }) => {
    if (!providerId) {
      const defaultProvider = await modelService.getDefaultProvider({
        model,
      })

      if (!defaultProvider) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_PROVIDER_NOT_FOUND',
        })
      }

      providerId = defaultProvider.id
    }

    const provider = await modelProviderRepository.get({
      where: {
        id: providerId,
        models: {
          some: {
            id: model.id,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    if (!provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND',
      })
    }
    if (provider.disabled && provider.fallback_id) {
      return sendByProvider({
        providerId: provider.fallback_id,
        model,
        ...params,
      })
    }
    if (provider.disabled) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_DISABLED',
      })
    }

    let result

    try {
      if (isOpenAIProvider(provider)) {
        if (params.message.images && params.message.images.length > 0) {
          result = await dalleGateway.edit(params)
        } else {
          result = await dalleGateway.send(params)
        }
      } else if (isG4FProvider(provider)) {
        const images = await g4fGateway.sendImage(params)
        result = {
          images,
          usage: null,
        }
      } else {
        throw new ForbiddenError({
          code: 'MODEL_PROVIDER_NOT_SUPPORTED',
        })
      }
    } catch (error) {
      return sendByFallbackProviderOrThrow({
        provider,
        model,
        error,
        ...params,
      })
    }

    return {
      ...result,
      provider_id: provider.id,
    }
  }

  const sendByFallbackProviderOrThrow = buildSendByFallbackProviderOrThrow({ sendByProvider })

  return sendByProvider
}

const buildSendByFallbackProviderOrThrow = ({
  sendByProvider,
}: {
  sendByProvider: SendImageByProvider
}) => {
  const sendByFallbackProviderOrThrow: SendImageByFallbackProvider = async ({
    provider,
    model,
    error,
    ...params
  }) => {
    const logEntry = {
      ...(error instanceof Error
        ? {
            message: `sendByFallbackProviderOrThrow[image] ${error.message}`,
          }
        : {
            message: `sendByFallbackProviderOrThrow[image] ${JSON.stringify(error)}`,
          }),
      providerName: provider.name,
      model: model.id,
      providerFallback: provider.fallback?.name ?? null,
    }

    if (provider.fallback && !provider.fallback.disabled) {
      try {
        logger.log({
          level: 'warn',
          ...logEntry,
        })

        return await sendByProvider({
          providerId: provider.fallback_id,
          model,
          ...params,
        })
      } catch (e) {
        logger.error(
          `sendByFallbackProviderOrThrow[image] Fallback provider ${provider.fallback_id} failed to send message`,
          { error: e },
        )

        throw error
      }
    }

    logger.log({
      level: 'error',
      ...logEntry,
    })

    throw error
  }

  return sendByFallbackProviderOrThrow
}
