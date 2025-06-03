import { Prisma } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { ForbiddenError, InternalError, NotFoundError } from '@/domain/errors'
import { isAudioModel, isImageModel, isMidjourney, isReplicateImageModel, isSpeechModel, isTextModel } from '@/domain/entity/model'
import { IChatSettings } from '@/domain/entity/chatSettings'

export type Update = (params: {
  userId: string
  id: string
  name?: string
  highlight?: string
  modelId?: string | null
  modelFunctionId?: string | null
  initial?: boolean
  groupId?: string
  order?: number
}) => Promise<IChat | never>

export const buildUpdate = ({ adapter, service }: UseCaseParams): Update => {
  return async ({ userId, id, name, highlight, modelId, modelFunctionId, initial, groupId, order }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || !subscription.plan) {
      throw new ForbiddenError()
    }

    const { plan } = subscription

    const includeSettings: Prisma.ChatSettingsInclude = {}

    if (modelId) {
      const model = await adapter.modelRepository.get({
        where: {
          id: modelId
        }
      })

      if (!model) {
        throw new NotFoundError({
          code: 'MODEL_NOT_FOUND'
        })
      }

      includeSettings.text = !!isTextModel(model) && {
        include: {
          preset: true
        }
      }
      includeSettings.image = isImageModel(model)
      includeSettings.mj = isMidjourney(model)
      includeSettings.replicateImage = isReplicateImageModel(model)
      includeSettings.speech = isSpeechModel(model)
      includeSettings.stt = isAudioModel(model)
    }

    let chat = await adapter.chatRepository.get({
      where: {
        id: id,
        user_id: userId,
        deleted: false
      },
      include: {
        model: true,
        model_function: true,
        settings: {
          include: includeSettings
        }
      }
    })

    if (!chat || !chat.model) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND'
      })
    }

    let settings: IChatSettings | null = chat.settings ?? null

    if (modelId && modelId !== chat.model.id) {
      const model = await adapter.modelRepository.get({
        where: {
          id: modelId
        }
      })

      if (!model) {
        throw new NotFoundError({
          code: 'MODEL_NOT_FOUND'
        })
      }

      if (settings && settings.text && settings.text.preset && settings.text.preset.model_id !== modelId) {
        await adapter.chatSettingsRepository.update({
          where: {
            id: settings.id
          },
          data: {
            text: {
              update: {
                data: {
                  preset_id: null
                }
              }
            }
          }
        })
      }

      settings = await service.chat.settings.upsert({
        chat,
        model,
        plan
      })

      const modelFunction = await adapter.modelFunctionRepository.get({
        where: {
          model_id: model.id,
          is_default: true
        }
      })

      modelFunctionId = modelFunction?.id ?? null
    }

    if (modelFunctionId && modelFunctionId !== chat.model_function_id) {
      const modelFunction = await adapter.modelFunctionRepository.get({
        where: {
          id: modelFunctionId
        }
      })

      if (modelFunction === null) {
        throw new NotFoundError({
          code: 'MODEL_FUNCTION_NOT_FOUND'
        })
      }
    }

    chat = await adapter.chatRepository.update({
      where: {
        id
      },
      data: {
        name,
        highlight,
        initial,
        ...(groupId && {
          group: {
            connect: {
              id: groupId
            }
          }
        }),
        ...(modelId && {
          model: {
            connect: {
              id: modelId
            }
          }
        }),
        ...(modelFunctionId && {
          model_function: {
            connect: {
              id: modelFunctionId
            }
          }
        }),
        ...(settings && {
          settings: {
            connect: {
              id: settings.id
            }
          }
        }),
        order
      }
    })

    if (!chat) {
      throw new InternalError()
    }

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'UPDATE',
        data: {
          chat
        }
      }
    })

    return chat
  }
}
