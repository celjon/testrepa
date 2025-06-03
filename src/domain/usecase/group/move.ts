import { IGroup } from '@/domain/entity/group'
import { UseCaseParams } from '../types'
import { NotFoundError } from '@/domain/errors'

export type Move = (params: { userId: string; groupId: string; startGroupId?: string }) => Promise<IGroup | null>

export const buildMove = ({ adapter }: UseCaseParams): Move => {
  return async ({ userId, groupId, startGroupId }) => {
    const groupToMove = await adapter.groupRepository.get({
      where: {
        id: groupId,
        user_id: userId
      }
    })

    if (!groupToMove || groupToMove.order === null) {
      throw new NotFoundError({
        code: 'GROUP_NOT_FOUND'
      })
    }

    if (startGroupId) {
      const startGroup = await adapter.groupRepository.get({
        where: {
          id: startGroupId,
          user_id: userId
        }
      })

      if (!startGroup || startGroup.order === null) {
        throw new NotFoundError({
          code: 'START_GROUP_NOT_FOUND'
        })
      }

      await adapter.groupRepository.updateMany({
        where: {
          user_id: userId,
          order: {
            gte: startGroup.order
          }
        },
        data: {
          order: {
            increment: 1
          }
        }
      })

      const movedGroup = await adapter.groupRepository.update({
        where: {
          id: groupId,
          user_id: userId
        },
        data: {
          order: startGroup.order
        }
      })
      return movedGroup
    } else {
      const lastGroup = await adapter.groupRepository.list({
        where: {
          user_id: userId
        },
        orderBy: {
          order: 'desc'
        },
        take: 1
      })

      const movedGroup = await adapter.groupRepository.update({
        where: {
          id: groupId,
          user_id: userId
        },
        data: {
          order: lastGroup[0].order ? lastGroup[0].order + 1 : 0
        }
      })

      return movedGroup
    }
  }
}
