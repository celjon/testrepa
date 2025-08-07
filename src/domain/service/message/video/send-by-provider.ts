import { Adapter } from '@/adapter'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { IChatVideoSettings } from '@/domain/entity/chat-settings'
import {
  isai302Provider,
  isGoogleGenAIProvider,
  isReplicateProvider,
  isRunwayProvider,
} from '@/domain/entity/model-provider'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { IModel } from '@/domain/entity/model'
import { Video } from '@/adapter/gateway/replicate/send-video'
import { IFile } from '@/domain/entity/file'
import { IUser } from '@/domain/entity/user'
import { config } from '@/config'
import { MINIO_STORAGE } from '@/adapter/consts'

type Params = Adapter & {
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
}

const validRatios = [
  '1280:720',
  '720:1280',
  '1104:832',
  '832:1104',
  '960:960',
  '1584:672',
  '1280:768',
  '768:1280',
] as const

type ValidRatio = (typeof validRatios)[number]

const getValidRatio = (ratio: string | undefined): ValidRatio => {
  return validRatios.includes(ratio as ValidRatio) ? (ratio as ValidRatio) : '1280:720'
}

export type SendVideoByProvider = (params: {
  providerId: string | null
  model: IModel
  message: IMessage
  settings: Partial<IChatVideoSettings>
  user: Pick<IUser, 'id'> & Partial<Pick<IUser, 'email'>>
}) => Promise<{
  video: Video
  provider_id: string
}>

export const buildSendVideoByProvider = ({
  replicateGateway,
  storageGateway,
  runwayGateway,
  modelProviderRepository,
  modelService,
  googleGenAIGateway,
  ai302Gateway,
}: Params) => {
  const sendByProvider: SendVideoByProvider = async ({ providerId, model, ...params }) => {
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
    if (!params.settings.duration_seconds) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
      })
    }
    let video: Video
    if (isai302Provider(provider)) {
      const imagePath = (params.message.images?.[0]?.original as IFile)?.path

      const getMinioPublicUrl = (path: string) => {
        return `https://${config.minio.host}/${MINIO_STORAGE}/${path}`
      }
      if (!imagePath) {
        throw new Error('No image path provided for video generation.')
      }
      const imageUrl = getMinioPublicUrl(imagePath)

      video = await ai302Gateway.generateVideo.generateVideo({
        imageUrl: imageUrl,
        message: params.message,
        model,
        settings: params.settings,
      })
    } else if (isGoogleGenAIProvider(provider)) {
      let imageBytes: string | undefined = ''
      if (params.message.images?.length && params.message.images[0]?.original) {
        const buffer = await storageGateway.read({
          path: (params.message.images![0].original as IFile).path!,
        })

        imageBytes = buffer.toString('base64')
      }
      video = await googleGenAIGateway.generateVideo({
        imageBytes,
        message: params.message,
        model,
        settings: params.settings,
      })
    } else if (isReplicateProvider(provider)) {
      video = await replicateGateway.sendVideo({
        message: params.message,
        model,
        settings: params.settings,
      })
    } else if (isRunwayProvider(provider)) {
      if (params.message.images && params.message.images?.length < 1) {
        throw new InvalidDataError({
          code: 'IMAGE_NOT_FOUND',
          message: 'Image is required',
        })
      }

      const buffer = await storageGateway.read({
        path: (params.message.images![0].original as IFile).path!,
      })

      const base64String = buffer.toString('base64')
      video = await runwayGateway.imageToVideo({
        model: model.id === 'gen4_turbo' ? model.id : 'gen3a_turbo',
        promptImage: `data:image/jpeg;base64,${base64String}`,
        ratio: getValidRatio(params.settings.aspect_ratio),
        duration: params.settings.duration_seconds === 10 ? 10 : 5,
        promptText: params.message.content ?? undefined,
      })
    } else {
      throw new ForbiddenError({
        code: 'MODEL_PROVIDER_NOT_SUPPORTED',
      })
    }

    return {
      video,
      provider_id: provider.id,
    }
  }

  return sendByProvider
}
