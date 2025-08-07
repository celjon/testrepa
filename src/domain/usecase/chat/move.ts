import { IChat } from '@/domain/entity/chat'
import { UseCaseParams } from '../types'
import { NotFoundError } from '@/domain/errors'

export type Move = (params: {
  userId: string
  chatIds: Array<string>
  groupId?: string
  startChatId?: string
}) => Promise<Array<IChat>>

export const buildMove = ({ adapter }: UseCaseParams): Move => {
  return async ({ chatIds, groupId, userId, startChatId }) => {
    const touchedChats: IChat[] = []

    if (!chatIds || chatIds.length === 0) {
      throw new Error('No chat IDs provided')
    }

    if (startChatId) {
      const startChat = await adapter.chatRepository.get({
        where: {
          id: startChatId,
          user_id: userId,
        },
      })

      if (!startChat || startChat.order === null) {
        throw new NotFoundError({
          code: 'START_CHAT_NOT_FOUND',
        })
      }

      const startOrder = startChat.order
      const offset = chatIds.length

      await adapter.chatRepository.updateMany({
        where: {
          user_id: userId,
          order: {
            gte: startOrder,
          },
          group_id: groupId,
        },
        data: {
          order: {
            increment: offset,
          },
        },
      })

      await Promise.all(
        chatIds.map(async (id, index) => {
          const updatedChat = await adapter.chatRepository.update({
            where: {
              id,
              user_id: userId,
            },
            data: {
              group_id: groupId,
              order: startOrder + index,
            },
          })

          touchedChats.push(updatedChat)
        }),
      )
    } else {
      const lastChat = await adapter.chatRepository.list({
        where: {
          user_id: userId,
          group_id: groupId,
        },
        orderBy: {
          order: 'desc',
        },
        take: 1,
      })

      await Promise.all(
        chatIds.map(async (id, index) => {
          const updatedChat = await adapter.chatRepository.update({
            where: {
              id,
              user_id: userId,
            },
            data: {
              group_id: groupId,
              order: lastChat[0] && lastChat[0].order ? lastChat[0].order + index + 1 : index + 1,
            },
          })
          touchedChats.push(updatedChat)
        }),
      )
    }

    return touchedChats
  }
}
