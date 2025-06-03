import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'

export type Get = (data: { userId: string; chatId: string }) => Promise<IChat | never>

export const buildGet = ({ adapter, service }: UseCaseParams): Get => {
  return async ({ userId, chatId }) => {
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

    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      },
      include: {
        model: true,
        model_function: true,
        group: true
      }
    })

    if (!chat) {
      throw new NotFoundError()
    }
    if (
      !chat.model ||
      !(await service.model.isAllowed({
        plan,
        modelId: chat.model.id
      }))
    ) {
      const defaultModel = await service.model.getDefault({
        plan
      })

      if (!defaultModel) {
        throw new NotFoundError({ code: 'DEFAULT_MODEL_NOT_FOUND' })
      }

      await adapter.chatRepository.update({
        where: {
          id: chatId
        },
        data: {
          model_id: defaultModel.id
        }
      })

      chat.model = defaultModel
      chat.model_id = defaultModel.id
    }

    return chat
  }
}
