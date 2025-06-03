import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'
import { isAudioModel, isImageModel, isReplicateImageModel, isSpeechModel, isTextModel } from '@/domain/entity/model'

export type GetInitial = (data: { userId: string; modelId?: string }) => Promise<IChat | never>

export const buildGetInitial = ({ adapter, service }: UseCaseParams): GetInitial => {
  return async ({ userId, modelId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || !subscription.plan) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND'
      })
    }

    const { plan } = subscription

    let chat = await adapter.chatRepository.get({
      where: {
        user_id: userId,
        deleted: false,
        initial: true
      },
      include: {
        model: true,
        model_function: true,
        group: true,
        settings: {
          include: {
            text: true,
            image: true,
            speech: true,
            replicateImage: true
          }
        }
      }
    })

    if (!chat) {
      chat = await service.chat.initialize({
        initial: true,
        userId,
        plan: subscription.plan
      })
    }

    if (modelId && chat.model_id !== modelId) {
      const isAllowed = await service.model.isAllowed({
        plan,
        modelId: modelId
      })
      const childModel = plan.models.find(({ model }) => model.id === modelId)?.model
      const parentModel = plan.models.find(({ model }) => model.id === childModel?.parent_id)?.model

      const modelWithoutChildren = childModel?.parent_id === null

      if (isAllowed && modelWithoutChildren && chat.model_id !== childModel.id) {
        await adapter.chatRepository.update({
          where: { id: chat.id },
          data: { model_id: childModel.id }
        })

        chat.model = childModel
        chat.model_id = childModel.id
      } else if (isAllowed && parentModel && childModel && childModel.parent_id !== null) {
        const parentModelChanged = chat.model_id !== parentModel.id
        if (parentModelChanged) {
          await adapter.chatRepository.update({
            where: { id: chat.id },
            data: { model_id: parentModel.id }
          })
        }

        await adapter.chatSettingsRepository.update({
          where: { chat_id: chat.id },
          data: {
            ...(isTextModel(childModel) && {
              text: {
                create: {
                  model: childModel.id,
                  max_tokens: childModel.max_tokens
                },
                update: {
                  model: childModel.id,
                  max_tokens: childModel.max_tokens
                }
              }
            }),
            ...(isImageModel(childModel) && {
              image: {
                create: {
                  model: childModel.id
                },
                update: {
                  model: childModel.id
                }
              }
            }),
            ...(isReplicateImageModel(childModel) && {
              replicateImage: {
                create: {
                  model: childModel.id
                },
                update: {
                  model: childModel.id
                }
              }
            }),
            ...(isSpeechModel(childModel) && {
              speech: {
                create: {
                  model: childModel.id
                },
                update: {
                  model: childModel.id
                }
              }
            }),
            ...(isAudioModel(childModel) && {
              stt: {
                create: {
                  model: childModel.id
                },
                update: {
                  model: childModel.id
                }
              }
            })
          }
        })

        chat.model = parentModel
        chat.model_id = parentModel.id
      }
    }

    if (
      !chat.model ||
      !(await service.model.isAllowed({
        plan,
        modelId: chat.model.id
      }))
    ) {
      const defaultParentModel = await service.model.getDefault({
        plan
      })

      if (!defaultParentModel) {
        throw new NotFoundError({ code: 'DEFAULT_MODEL_NOT_FOUND' })
      }

      await adapter.chatRepository.update({
        where: {
          id: chat.id
        },
        data: {
          model_id: defaultParentModel.id
        }
      })

      chat.model = defaultParentModel
      chat.model_id = defaultParentModel.id
    }

    return chat
  }
}
