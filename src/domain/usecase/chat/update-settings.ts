import { FileType, MidjourneyMode } from '@prisma/client'
import { InternalError, NotFoundError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chat-settings'
import {
  isSpeechToTextModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isReplicateVideoModel,
  isTextToSpeechModel,
  isTextModel,
  isVideoModel,
  IModel,
} from '@/domain/entity/model'
import { RawFileWithoutBuffer } from '@/domain/entity/file'
import { UseCaseParams } from '../types'
import { RUNWAY_ASPECT_RATIOS } from '@/domain/service/chat/settings/video/create-element'

export type UpdateSettings = (params: {
  userId: string
  chatId: string
  values?: Record<string, null | string | number | boolean | RawFileWithoutBuffer[]>
}) => Promise<IChatSettings | never>

export const buildUpdateSettings =
  ({ adapter, service }: UseCaseParams): UpdateSettings =>
  async ({ userId, chatId, values = {} }) => {
    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false,
      },
      include: {
        model: true,
        settings: {
          include: {
            video: true,
          },
        },
      },
    })

    if (!chat || !chat.model || !chat.settings) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

    let childModel: IModel | null = null
    if ('model' in values && typeof values.model === 'string') {
      childModel = await adapter.modelRepository.get({
        where: { id: values.model },
      })

      if (!childModel) {
        throw new NotFoundError({
          code: 'MODEL_NOT_FOUND',
          message: `No child model found with id ${values.model}`,
        })
      }

      if (childModel.parent_id !== chat.model_id) {
        // temporarily disable as telegram bot doesn't support updating chat.model before settings.model
        // throw new InvalidDataError({
        //   code: 'INVALID_MODEL',
        //   message: 'This model cannot be set because chat.model_id != childModel.parent_id'
        // })
      }
    }

    const settings = await adapter.chatSettingsRepository.update({
      where: {
        id: chat.settings.id,
      },
      data: {
        ...(isTextModel(chat.model) && {
          text: {
            update: Object.keys(values).reduce<
              Record<string, null | string | number | boolean | File[]>
            >((settings, name) => {
              const value = values[name]
              const isChildModelChanged = 'model' in values && typeof values.model === 'string'

              return {
                ...settings,
                ...(isChildModelChanged && childModel
                  ? {
                      max_tokens: childModel.max_tokens,
                    }
                  : {}),
                [name]: value,
                ...(name === 'preset_id' &&
                  !value && {
                    system_prompt: '',
                    full_system_prompt: '',
                  }),
                ...(Array.isArray(value) && {
                  [name]: {
                    deleteMany: {
                      name: {
                        notIn: value
                          .filter(({ size }) => size === 0)
                          .map(({ originalname }) => originalname),
                      },
                    },
                    create: value
                      .filter(({ size }) => size !== 0)
                      .map((file) => ({
                        type: FileType.DOCUMENT,
                        path: file.path,
                        name: file.originalname,
                      })),
                  },
                }),
              }
            }, {}),
          },
        }),
        ...(isMidjourney(chat.model)
          ? {
              mj: {
                update: Object.keys(values).reduce((acc, key) => {
                  let mjValue = values[key]
                  const currentMjSettings = chat.settings?.mj

                  const currentMode = values.mode ?? currentMjSettings?.mode ?? MidjourneyMode.FAST
                  const newVersion =
                    key === 'version' ? mjValue : (values.version ?? currentMjSettings?.version)

                  if (key === 'mode' && typeof mjValue === 'string') {
                    mjValue =
                      newVersion === '7' && mjValue !== MidjourneyMode.RELAX
                        ? MidjourneyMode.TURBO
                        : mjValue
                  }

                  if (key === 'version' && typeof mjValue === 'string') {
                    acc.mode =
                      mjValue === '7' && currentMode !== MidjourneyMode.RELAX
                        ? MidjourneyMode.TURBO
                        : currentMode === MidjourneyMode.TURBO &&
                            mjValue !== '5.2' &&
                            mjValue !== '7'
                          ? MidjourneyMode.FAST
                          : currentMode
                  }

                  return {
                    ...acc,
                    [key]: mjValue,
                  }
                }, values),
              },
            }
          : isReplicateImageModel(chat.model)
            ? {
                replicateImage: {
                  update: service.chat.settings.replicateImage.update({
                    values,
                  }),
                },
              }
            : isImageModel(chat.model)
              ? {
                  image: {
                    update: service.chat.settings.image.update({
                      values,
                    }),
                  },
                }
              : isTextToSpeechModel(chat.model)
                ? {
                    speech: {
                      update: values,
                    },
                  }
                : isSpeechToTextModel(chat.model)
                  ? { stt: { update: values } }
                  : isVideoModel(chat.model)
                    ? {
                        video: {
                          update: Object.keys(values).reduce((acc, key) => {
                            let videoValue = values[key]
                            const currentVideoSettings = chat.settings?.video
                            if (key === 'model' && typeof videoValue === 'string') {
                              const newModel = videoValue

                              if (isReplicateVideoModel(chat.model!)) {
                                const currentAspectRatio = currentVideoSettings!.aspect_ratio
                                const allowedRatios = ['16:9', '9:16']

                                acc.aspect_ratio = allowedRatios.includes(currentAspectRatio)
                                  ? currentAspectRatio
                                  : '16:9'
                                const currentQuality = currentVideoSettings!.quality
                                const allowedQuality = ['standard', 'high']

                                acc.quality = allowedQuality.includes(currentQuality)
                                  ? currentQuality
                                  : 'standard'
                              } else {
                                const currentAspectRatio = currentVideoSettings!.aspect_ratio
                                const allowedRatios = RUNWAY_ASPECT_RATIOS[newModel] || []

                                acc.aspect_ratio = allowedRatios.includes(currentAspectRatio)
                                  ? currentAspectRatio
                                  : allowedRatios[0]
                              }
                            }
                            if (key === 'duration_seconds' && typeof videoValue === 'string') {
                              videoValue = parseInt(videoValue)
                            }
                            return {
                              ...acc,
                              [key]: videoValue,
                            }
                          }, values),
                        },
                      }
                    : {}),
      },
      include: {
        text: isTextModel(chat.model) ? { include: { files: true } } : false,
        image: isImageModel(chat.model),
        mj: isMidjourney(chat.model),
        replicateImage: isReplicateImageModel(chat.model),
        speech: isTextToSpeechModel(chat.model),
        stt: isSpeechToTextModel(chat.model),
        video: isVideoModel(chat.model),
      },
    })

    if (!settings) {
      throw new InternalError({
        code: 'INVALID_SETTINGS',
      })
    }

    if (isTextModel(chat.model) && settings.text) {
      const textSettings = settings.text
      const { files } = textSettings

      if (
        files &&
        (('files' in values && Array.isArray(values.files)) || 'system_prompt' in values)
      ) {
        const { prompt } = await service.message.generatePrompt({
          content: textSettings.system_prompt,
          files,
        })

        await adapter.chatSettingsRepository.update({
          where: { id: chat.settings.id },
          data: {
            text: {
              update: {
                full_system_prompt: prompt,
              },
            },
          },
        })
      }
    }

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'SETTINGS_UPDATE',
        data: {
          settings,
        },
      },
    })

    return settings
  }
