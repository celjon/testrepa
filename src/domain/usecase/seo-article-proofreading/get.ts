import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

export type Get = (params: { id: string }) => Promise<ISEOArticleProofreading>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const seoArticleProofreading = await adapter.seoArticleProofreadingRepository.get({
      where: { id },
    })

    if (!seoArticleProofreading) {
      throw new NotFoundError({
        code: 'PROOFREADING_NOT_FOUND',
      })
    }

    return seoArticleProofreading
  }
}
