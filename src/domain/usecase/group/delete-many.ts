import { UseCaseParams } from '@/domain/usecase/types'
import { IGroup } from '@/domain/entity/group'

export type DeleteMany = (data: { userId: string; ids: Array<string> }) => Promise<IGroup[] | never>

export const buildDeleteMany = ({ adapter }: UseCaseParams): DeleteMany => {
  return async ({ userId, ids }) => {
    const groups = await adapter.groupRepository.list({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
    })

    await adapter.groupRepository.deleteMany({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
    })

    return groups
  }
}
