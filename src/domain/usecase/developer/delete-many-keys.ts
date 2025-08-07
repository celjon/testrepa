import { UseCaseParams } from '../types'
import { IDeveloperKey } from '@/domain/entity/developer-key'

export type DeleteManyKeys = (params: {
  ids: Array<string>
  userId: string
}) => Promise<Array<IDeveloperKey>>

export const buildDeleteManyKeys = ({ adapter }: UseCaseParams): DeleteManyKeys => {
  return async ({ ids, userId }) => {
    const keys = await adapter.developerKeyRepository.list({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
        deleted: false,
      },
    })

    await adapter.developerKeyRepository.updateMany({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
      data: {
        deleted: true,
      },
    })

    return keys
  }
}
