import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

export type Create = (params: { expert_id: string; article_id: string }) => Promise<ISEOArticleProofreading>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ expert_id, article_id }) => {
    const seoArticleProofreading = await adapter.seoArticleProofreadingRepository.create({
      data: { expert_id, article_id }
    })
    if (!seoArticleProofreading) {
      throw new NotFoundError({
        code: 'PROOFREADING_NOT_FOUND'
      })
    }
    await adapter.articleRepository.update({ where: { id: article_id }, data: { published_at: new Date() } })
    return seoArticleProofreading
  }
}
