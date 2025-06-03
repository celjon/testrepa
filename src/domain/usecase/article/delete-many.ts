import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type DeleteMany = (params: { ids: string[] }) => Promise<number>

export const buildDeleteMany = ({ adapter }: UseCaseParams): DeleteMany => {
  return async ({ ids }) => {
    if (ids.length === 0) {
      throw new NotFoundError({
        code: 'NO_IDS_PROVIDED'
      })
    }
    const deletedCount = await adapter.articleRepository.deleteMany({
      where: { id: { in: ids } }
    })

    return deletedCount
  }
}
