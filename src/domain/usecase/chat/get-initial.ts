import { logger } from '@/lib/logger'
import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'
import {
  isSpeechToTextModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isTextToSpeechModel,
  isTextModel,
} from '@/domain/entity/model'

export type GetInitial = (data: {
  userId: string
  modelId?: string // child model id
}) => Promise<IChat | never>

export const buildGetInitial = ({ adapter, service }: UseCaseParams): GetInitial => {
  return async ({ userId, modelId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || !subscription.plan) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    }

    const { plan } = subscription

    let chat = await adapter.chatRepository.get({
      where: {
        user_id: userId,
        deleted: false,
        initial: true,
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
            replicateImage: true,
          },
        },
      },
    })

    if (!chat) {
      chat = await service.chat.initialize({
        initial: true,
        userId,
        plan: subscription.plan,
      })
    }

    if (modelId && chat.model_id !== modelId) {
      const isAllowed = await service.model.isAllowed({
        plan,
        modelId: modelId,
      })
      const childModel = plan.models.find(({ model }) => model.id === modelId)?.model
      const parentModel = plan.models.find(({ model }) => model.id === childModel?.parent_id)?.model

      const modelWithoutChildren = childModel?.parent_id === null

      if (isAllowed && modelWithoutChildren) {
        let modelFunctionId = undefined
        if (isMidjourney({ id: modelId })) {
          const [modelFunction] = await Promise.all([
            adapter.modelFunctionRepository.get({
              where: {
                model_id: modelId,
                is_default: true,
              },
            }),
            adapter.chatSettingsRepository.update({
              where: { chat_id: chat.id },
              data: {
                mj: {
                  create: { style: 'default' },
                  update: { style: 'default' },
                },
              },
            }),
          ])
          modelFunctionId = modelFunction?.id
        }

        await adapter.chatRepository.update({
          where: { id: chat.id },
          data: { model_id: childModel.id, model_function_id: modelFunctionId },
        })

        chat.model = childModel
        chat.model_id = childModel.id
      } else if (isAllowed && parentModel && childModel && childModel.parent_id !== null) {
        const parentModelChanged = chat.model_id !== parentModel.id

        await Promise.all([
          parentModelChanged &&
            adapter.chatRepository.update({
              where: { id: chat.id },
              data: { model_id: parentModel.id },
            }),
          adapter.chatSettingsRepository.update({
            where: { chat_id: chat.id },
            data: {
              ...(isTextModel(childModel) && {
                text: {
                  create: service.chat.settings.text.create({ defaultModel: childModel }),
                  update: service.chat.settings.text.update({ defaultModel: childModel }),
                },
              }),
              ...(isImageModel(childModel) &&
                !isReplicateImageModel(childModel) && {
                  image: {
                    create: service.chat.settings.image.create({ defaultModel: childModel }),
                    update: service.chat.settings.image.update({ defaultModel: childModel }),
                  },
                }),
              ...(isReplicateImageModel(childModel) && {
                replicateImage: {
                  create: service.chat.settings.replicateImage.create({
                    defaultModel: childModel,
                    settings: {
                      model: childModel.id,
                    },
                  }),
                  update: service.chat.settings.replicateImage.update({
                    defaultModel: childModel,
                    settings: {
                      model: childModel.id,
                    },
                  }),
                },
              }),
              ...(isTextToSpeechModel(childModel) && {
                speech: {
                  create: service.chat.settings.textToSpeech.create({ defaultModel: childModel }),
                  update: service.chat.settings.textToSpeech.update({ defaultModel: childModel }),
                },
              }),
              ...(isSpeechToTextModel(childModel) && {
                stt: {
                  create: service.chat.settings.speechToText.create({ defaultModel: childModel }),
                  update: service.chat.settings.speechToText.update({ defaultModel: childModel }),
                },
              }),
              // midjourney doesn't have child model, so this branch never will be executed for mj
            },
          }),
        ])

        chat.model = parentModel
        chat.model_id = parentModel.id
      }
    }

    if (
      !chat.model ||
      !(await service.model.isAllowed({
        plan,
        modelId: chat.model.id,
      }))
    ) {
      const defaultParentModel = await service.model.getDefault({
        plan,
      })

      if (!defaultParentModel) {
        logger.error({
          location: 'chat.getInitial',
          message: 'DEFAULT_MODEL_NOT_FOUND',
          userId,
          modelId,
          chatModelId: chat.model?.id,
        })
        throw new NotFoundError({ code: 'DEFAULT_MODEL_NOT_FOUND' })
      }

      await adapter.chatRepository.update({
        where: {
          id: chat.id,
        },
        data: {
          model_id: defaultParentModel.id,
        },
      })

      chat.model = defaultParentModel
      chat.model_id = defaultParentModel.id
    }

    return chat
  }
}
