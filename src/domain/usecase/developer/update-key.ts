import { UseCaseParams } from '../types'
import { IDeveloperKey } from '@/domain/entity/developer-key'

export type UpdateKey = (params: {
  id: string
  userId: string
  label: string
}) => Promise<IDeveloperKey | null | never>

export const buildUpdateKey = ({ adapter }: UseCaseParams): UpdateKey => {
  return async ({ id, userId, label }) => {
    return await adapter.developerKeyRepository.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        label,
      },
    })
  }
}
