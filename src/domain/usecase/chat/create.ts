import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError } from '@/domain/errors'
import { ChatPlatform, IChat } from '@/domain/entity/chat'

export type Create = (data: {
  userId: string
  name?: string | null
  modelId?: string
  highlight?: string
  groupId?: string
  initial?: boolean
  platform?: ChatPlatform
  order?: number
}) => Promise<IChat | never>
export const buildCreate = ({ service, adapter }: UseCaseParams): Create => {
  return async ({ userId, name, modelId, groupId, highlight, initial, platform, order }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || !subscription.plan) {
      throw new ForbiddenError()
    }

    const chat = await service.chat.initialize({
      userId,
      groupId,
      highlight,
      name,
      modelId,
      initial,
      platform,
      plan: subscription.plan,
      order,
    })

    await adapter.chatRepository.updateMany({
      where: {
        user_id: userId,
        group_id: null,
        id: {
          not: chat.id,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    })

    return chat
  }
}
