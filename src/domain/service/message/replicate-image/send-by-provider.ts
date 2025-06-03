import { Adapter } from '../../../types'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { IChatReplicateImageSettings } from '@/domain/entity/chatSettings'
import { isReplicateProvider } from '@/domain/entity/modelProvider'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IModel } from '@/domain/entity/model'
import { logger } from '@/lib/logger'

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

export type SendReplicateImageByProvider = (params: {
  providerId: string | null
  model: IModel
  message: IMessage
  settings: Partial<IChatReplicateImageSettings>
  endUserId: string
}) => Promise<Image[]>

export const buildSendReplicateImageByProvider = ({ replicateGateway, modelProviderRepository, modelService }: Params) => {
  const sendByProvider: SendReplicateImageByProvider = async ({ providerId, model, ...params }) => {
    if (!providerId) {
      const defaultProvider = await modelService.getDefaultProvider({
        model
      })

      if (!defaultProvider) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_PROVIDER_NOT_FOUND'
        })
      }

      providerId = defaultProvider.id
    }

    const provider = await modelProviderRepository.get({
      where: {
        id: providerId,
        disabled: { not: true },
        models: {
          some: { id: model.id }
        }
      },
      orderBy: { order: 'asc' }
    })

    if (!provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND',
        message: `Model provider not found for model ${model.id}`
      })
    }

    let images: Image[]

    try {
      if (isReplicateProvider(provider)) {
        images = await replicateGateway.sendImage({
          ...params,
          model
        })
      } else {
        throw new ForbiddenError({
          code: 'MODEL_PROVIDER_NOT_SUPPORTED',
          message: `Model provider ${provider.id} is not supported`
        })
      }
    } catch (error) {
      logger.error('SendReplicateImageByProvider', error)

      if (provider.fallback_id) {
        try {
          return await sendByProvider({
            providerId: provider.fallback_id,
            model,
            ...params
          })
        } catch (e) {
          logger.error('sendByFallbackProviderOrThrow[replicate-image]', e)

          throw error
        }
      }

      throw error
    }

    return images
  }

  return sendByProvider
}
