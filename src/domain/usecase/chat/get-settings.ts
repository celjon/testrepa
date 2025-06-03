import { Platform } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chatSettings'
import {
  isAudioModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isSpeechModel,
  isTextModel,
  isVideoModel
} from '@/domain/entity/model'
import { ChatPlatform } from '@/domain/entity/chat'
import { UseCaseParams } from '../types'

export type GetSettings = (params: {
  userId: string
  chatId: string
  all?: boolean
  elements?: boolean
  platform?: ChatPlatform
}) => Promise<IChatSettings | never>

export const buildGetSettings =
  ({ adapter, service }: UseCaseParams): GetSettings =>
  async ({ userId, chatId, all = false, elements = false, platform }) => {
    const { model } = (await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      },
      select: {
        model: true
      }
    })) ?? { model: null }

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      },
      include: {
        user: true,
        model: true,
        settings: {
          include: {
            ...(all && {
              text: {
                include: {
                  preset: true,
                  files: true
                }
              },
              image: true,
              mj: true,
              replicateImage: true,
              speech: true
            }),
            ...(!all && {
              text: isTextModel(model),
              image: isImageModel(model),
              mj: isMidjourney(model),
              replicateImage: isReplicateImageModel(model),
              speech: isSpeechModel(model),
              stt: isAudioModel(model),
              video: isVideoModel(model)
            })
          }
        }
      }
    })

    if (!chat || !chat.model || !chat.settings || !chat.user) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND'
      })
    }

    const subscription = await service.user.getActualSubscriptionById(chat.user.id)

    if (!subscription || !subscription.plan) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND'
      })
    }

    const { plan } = subscription

    chat.settings = await service.chat.settings.upsert({
      chat,
      model: chat.model,
      plan,
      disableUpdate: true
    })

    const getDefaultChildModelOrThrow = async () => {
      const defaultModel = await service.model.getDefault({
        plan,
        parentId: chat.model_id
      })
      if (!defaultModel) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_NOT_FOUND'
        })
      }
      return defaultModel
    }

    if (
      isTextModel(chat.model) &&
      chat.settings.text &&
      !(await service.model.isAllowed({
        plan,
        parentId: chat.model_id,
        modelId: chat.settings.text.model
      })) &&
      platform !== Platform.TELEGRAM // telegram bot currently doesn't change chat.model_id before changing chat.settings.text.model
    ) {
      const defaultModel = await getDefaultChildModelOrThrow()

      await adapter.chatSettingsRepository.update({
        where: {
          id: chat.settings.id
        },
        data: {
          text: {
            update: {
              model: defaultModel.id
            }
          }
        }
      })

      chat.settings.text.model = defaultModel.id
    } else if (
      isReplicateImageModel(chat.model) &&
      chat.settings.replicateImage &&
      !(await service.model.isAllowed({
        plan,
        parentId: chat.model_id,
        modelId: chat.settings.replicateImage.model
      }))
    ) {
      const defaultModel = await getDefaultChildModelOrThrow()

      await adapter.chatSettingsRepository.update({
        where: {
          id: chat.settings.id
        },
        data: {
          replicateImage: {
            update: {
              model: defaultModel.id
            }
          }
        }
      })

      chat.settings.replicateImage.model = defaultModel.id
    } else if (
      isImageModel(chat.model) &&
      !isMidjourney(chat.model) &&
      chat.settings.image &&
      !(await service.model.isAllowed({
        plan,
        parentId: chat.model_id,
        modelId: chat.settings.image.model
      }))
    ) {
      const defaultModel = await getDefaultChildModelOrThrow()

      await adapter.chatSettingsRepository.update({
        where: {
          id: chat.settings.id
        },
        data: {
          image: {
            update: {
              model: defaultModel.id
            }
          }
        }
      })

      chat.settings.image.model = defaultModel.id
    }

    if (!all) {
      const settings = await adapter.chatSettingsRepository.get({
        where: {
          id: chat.settings.id
        },
        include: {
          ...(isTextModel(chat.model) && {
            text: {
              include: {
                preset: true,
                files: true
              }
            }
          }),
          image: isImageModel(chat.model),
          mj: isMidjourney(chat.model),
          replicateImage: isReplicateImageModel(chat.model),
          speech: isSpeechModel(chat.model),
          stt: isAudioModel(chat.model),
          video: isVideoModel(chat.model)
        }
      })
      if (!settings) {
        throw new NotFoundError({
          code: 'SETTINGS_NOT_FOUND'
        })
      }

      chat.settings = settings
    }

    const determinedPlatform = platform === Platform.TELEGRAM ? Platform.TELEGRAM : Platform.WEB

    if (elements) {
      if (isTextModel(chat.model) && chat.settings.text) {
        chat.settings.elements = await service.chat.settings.text.createElements({
          chat,
          plan,
          settings: chat.settings.text,
          platform: determinedPlatform
        })
      } else if (isMidjourney(chat.model) && chat.settings.mj) {
        chat.settings.elements = service.chat.settings.midjourney.createElements({
          chat,
          settings: chat.settings.mj
        })
      } else if (isReplicateImageModel(model) && chat.settings.replicateImage) {
        chat.settings.elements = await service.chat.settings.replicateImage.createElements({
          chat,
          plan,
          settings: chat.settings.replicateImage,
          platform: determinedPlatform
        })
      } else if (isImageModel(chat.model) && chat.settings.image) {
        chat.settings.elements = await service.chat.settings.image.createElements({
          chat,
          plan,
          settings: chat.settings.image,
          platform: determinedPlatform
        })
      } else if (isSpeechModel(chat.model) && chat.settings.speech) {
        chat.settings.elements = await service.chat.settings.speech.createElements({
          chat,
          plan,
          settings: chat.settings.speech,
          platform: determinedPlatform
        })
      } else if (isAudioModel(chat.model) && chat.settings.stt) {
        chat.settings.elements = await service.chat.settings.speech2text.createElements({
          chat,
          plan,
          settings: chat.settings.stt,
          platform: determinedPlatform
        })
      } else if (isVideoModel(chat.model) && chat.settings.video) {
        chat.settings.elements = await service.chat.settings.video.createElements({
          chat,
          plan,
          settings: chat.settings.video,
          platform: determinedPlatform
        })
      } else {
        throw new NotFoundError({
          code: 'SETTINGS_NOT_FOUND'
        })
      }
    }

    return chat.settings
  }
