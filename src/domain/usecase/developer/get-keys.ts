import { IDeveloperKey } from '@/domain/entity/developerKey'
import { UseCaseParams } from '../types'

export type GetKeys = (data: { userId: string }) => Promise<Array<IDeveloperKey>> | never

export const buildGetKeys = ({ adapter }: UseCaseParams): GetKeys => {
  return async ({ userId }) => {
    const developerKeys = await adapter.developerKeyRepository.list({
      where: {
        user_id: userId,
        deleted: false
      }
    })

    return developerKeys
  }
}
