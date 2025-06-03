import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

export type Delete = (params: { id: string }) => Promise<ISEOArticleProofreading>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let seoArticleProofreading = await adapter.seoArticleProofreadingRepository.get({ where: { id } })
    if (seoArticleProofreading) {
      seoArticleProofreading = await adapter.seoArticleProofreadingRepository.delete({
        where: { id }
      })
    }
    if (!seoArticleProofreading) {
      throw new NotFoundError({
        code: 'PROOFREADING_NOT_FOUND'
      })
    }

    return seoArticleProofreading
  }
}
