import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { ForbiddenError } from '@/domain/errors'

export type DeleteAllExcept = (data: {
  userId: string
  idsToKeep: string[]
  groupIdsToKeep?: string[]
}) => Promise<IChat[] | never>

export const buildDeleteAllExcept = ({ adapter }: UseCaseParams): DeleteAllExcept => {
  return async ({ userId, idsToKeep, groupIdsToKeep = [] }) => {
    // safety check, we cannot believe typescript here
    // consequences of userId === undefined are very bad
    if (!userId) {
      throw new ForbiddenError({
        code: 'FORBIDDEN',
      })
    }

    if (groupIdsToKeep.length === 0) {
      const chats = await adapter.chatRepository.list({
        where: {
          id: {
            notIn: idsToKeep,
          },
          user_id: userId,
        },
      })

      await adapter.chatRepository.deleteMany({
        where: {
          id: {
            notIn: idsToKeep,
          },
          user_id: userId,
        },
      })
      return chats
    }

    const chats = await adapter.chatRepository.list({
      where: {
        id: {
          notIn: idsToKeep,
        },
        OR: [
          {
            group_id: null,
          },
          {
            group_id: {
              notIn: groupIdsToKeep,
            },
          },
        ],
        user_id: userId,
      },
    })

    await adapter.chatRepository.deleteMany({
      where: {
        id: {
          notIn: idsToKeep,
        },
        OR: [
          {
            group_id: null,
          },
          {
            group_id: {
              notIn: groupIdsToKeep,
            },
          },
        ],
        user_id: userId,
      },
    })

    return chats
  }
}
