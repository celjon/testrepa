import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Update = (params: {
  id: string
  expert_id?: string
  article_id?: string
}) => Promise<ISEOArticleProofreading>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ id, expert_id, article_id }) => {
    let seoArticleProofreading = await adapter.seoArticleProofreadingRepository.get({
      where: { id },
    })
    if (seoArticleProofreading) {
      seoArticleProofreading = await adapter.seoArticleProofreadingRepository.update({
        where: { id: id },
        data: { expert_id, article_id },
      })
    }
    if (!seoArticleProofreading) {
      throw new NotFoundError({
        code: 'PROOFREADING_NOT_FOUND',
      })
    }

    return seoArticleProofreading
  }
}
