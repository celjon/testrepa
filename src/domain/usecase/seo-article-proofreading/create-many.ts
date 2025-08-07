import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type CreateMany = (params: {
  proofreadings: {
    expert_id: string
    article_id: string
  }[]
}) => Promise<number>

export const buildCreateMany = ({ adapter }: UseCaseParams): CreateMany => {
  return async ({ proofreadings }) => {
    if (proofreadings.length === 0) {
      throw new NotFoundError({
        message: 'NO_PROOFREADINGS_PROVIDED',
      })
    }
    const expert = await adapter.seoArticleExpertRepository.get({
      where: { id: proofreadings[0].expert_id },
    })
    if (!expert) {
      throw new NotFoundError({
        message: 'EXPERT_NOT_FOUND',
      })
    }
    const createdCount = await adapter.seoArticleProofreadingRepository.createMany({
      data: proofreadings,
    })

    const articleIdsToUpdate = proofreadings.map((proofreading) => proofreading.article_id)

    if (articleIdsToUpdate.length > 0) {
      await adapter.articleRepository.updateMany({
        where: { id: { in: articleIdsToUpdate } },
        data: { published_at: new Date() },
      })
    }

    return createdCount
  }
}
