import { IChat } from '@/domain/entity/chat'
import { IPlan } from '@/domain/entity/plan'
import { Adapter } from '@/domain/types'
import { Prisma } from '@prisma/client'
import { TextService } from './text'
import { ImageService } from './image'
import { MidjourneyService } from './midjourney'
import {
  IModel,
  isAudioModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isSpeechModel,
  isTextModel,
  isVideoModel
} from '@/domain/entity/model'
import { NotFoundError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chatSettings'
import { ModelService } from '../../model'
import { ReplicateImageService } from './replicateImage'
import { SpeechService } from './speech'
import { VideoService } from './video'

type Params = Adapter & {
  modelService: ModelService
  textService: TextService
  imageService: ImageService
  midjourneyService: MidjourneyService
  replicateImageService: ReplicateImageService
  speechService: SpeechService
  videoService: VideoService
}

type Settings = {
  text?: Prisma.ChatTextSettingsUpdateOneWithoutSettingsNestedInput
  image?: Prisma.ChatImageSettingsUpdateOneWithoutSettingsNestedInput
  mj?: Prisma.ChatMidjourneySettingsUpdateOneWithoutSettingsNestedInput
  replicateImage?: Prisma.ChatReplicateImageSettingsUpdateOneWithoutSettingsNestedInput
  speech?: Prisma.ChatSpeechSettingsUpdateOneWithoutSettingsNestedInput
  stt?: Prisma.ChatSTTSettingsUpdateOneWithoutSettingsNestedInput
  video?: Prisma.ChatVideoSettingsUpdateOneWithoutSettingsNestedInput
}

// Handles changes of chat.model, sets appropriate default child model in settings
export type Upsert = (params: {
  chat?: IChat
  // parent model
  model: IModel
  plan: IPlan
  disableUpdate?: boolean
}) => Promise<IChatSettings>

export const buildUpsert =
  ({
    chatSettingsRepository,
    textService,
    imageService,
    midjourneyService,
    replicateImageService,
    speechService,
    modelService,
    videoService
  }: Params): Upsert =>
  async ({ chat, model, plan, disableUpdate = false }) => {
    const getDefaultChildModelOrThrow = async () => {
      const defaultModel = await modelService.getDefault({
        plan,
        parentId: model.id
      })
      if (!defaultModel) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_NOT_FOUND'
        })
      }
      return defaultModel
    }

    const newSettings: Settings = {}

    if (isTextModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()
      if (!chat || !chat.settings || !chat.settings.text) {
        newSettings.text = {
          create: textService.create({
            defaultModel
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.text = {
          update: {
            model: defaultModel.id,
            max_tokens: defaultModel.max_tokens
          }
        }
      }
    } else if (isMidjourney(model)) {
      if (!chat || !chat.settings || !chat.settings.mj) {
        newSettings.mj = {
          create: midjourneyService.create({
            plan
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.mj = {
          update: {}
        }
      }
    } else if (isReplicateImageModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()

      if (!chat || !chat.settings || !chat?.settings?.replicateImage) {
        newSettings.replicateImage = {
          create: replicateImageService.create({
            defaultModel
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.replicateImage = {
          update: replicateImageService.update({
            defaultModel,
            settings: chat.settings.replicateImage
          })
        }
      }
    } else if (isSpeechModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()

      if (!chat || !chat.settings || !chat.settings.speech) {
        newSettings.speech = {
          create: speechService.create({
            defaultModel
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.speech = {
          update: {
            model: defaultModel.id
          }
        }
      }
    } else if (isImageModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()

      if (!chat || !chat.settings || !chat.settings.image) {
        newSettings.image = {
          create: imageService.create({
            defaultModel
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.image = {
          update: {
            model: defaultModel.id
          }
        }
      }
    } else if (isAudioModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()

      if (!chat || !chat.settings || !chat.settings.stt) {
        newSettings.stt = {
          create: {
            model: defaultModel.id
          }
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.stt = {
          create: {
            model: defaultModel.id
          }
        }
      }
    } else if (isVideoModel(model)) {
      const defaultModel = await getDefaultChildModelOrThrow()

      if (!chat || !chat.settings || !chat?.settings?.video) {
        newSettings.video = {
          create: videoService.create({
            defaultModel
          })
        }
      } else {
        if (chat.settings && disableUpdate) {
          return chat.settings
        }

        newSettings.video = {
          update: {
            model: defaultModel.id
          }
        }
      }
    }

    let settings: IChatSettings | null = chat?.settings ?? null
    const includeSettings: Prisma.ChatSettingsInclude = Object.keys(newSettings).reduce(
      (include, key) => ({
        ...include,
        [key]: true
      }),
      {}
    )

    if (settings) {
      settings = await chatSettingsRepository.update({
        where: {
          id: settings.id
        },
        data: newSettings,
        include: includeSettings
      })
    } else {
      settings = await chatSettingsRepository.create({
        data: newSettings,
        include: includeSettings
      })
    }

    if (!settings) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND'
      })
    }

    return settings
  }
