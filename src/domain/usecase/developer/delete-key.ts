import { UseCaseParams } from '../types'
import { IDeveloperKey } from '@/domain/entity/developer-key'

export type DeleteKey = (params: {
  id: string
  userId: string
}) => Promise<IDeveloperKey | null | never>

export const buildDeleteKey = ({ adapter }: UseCaseParams): DeleteKey => {
  return async ({ id, userId }) => {
    return await adapter.developerKeyRepository.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        deleted: true,
      },
    })
  }
}
