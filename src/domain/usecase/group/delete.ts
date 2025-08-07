import { UseCaseParams } from '@/domain/usecase/types'
import { IGroup } from '@/domain/entity/group'
import { ForbiddenError } from '@/domain/errors'

export type Delete = (data: {
  userId: string
  groupId: string
}) => Promise<IGroup | undefined | never>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ userId, groupId }) => {
    const group = await adapter.groupRepository.get({
      where: {
        id: groupId,
        user_id: userId,
      },
    })

    if (!group) {
      throw new ForbiddenError()
    }

    await adapter.groupRepository.delete({
      where: {
        id: groupId,
        user_id: userId,
      },
    })

    return group
  }
}
