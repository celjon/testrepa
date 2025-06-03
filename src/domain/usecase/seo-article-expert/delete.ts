import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

export type Delete = (params: { id: string }) => Promise<ISEOArticleExpert>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let seoArticleExpert = await adapter.seoArticleExpertRepository.get({ where: { id } })
    if (seoArticleExpert) {
      seoArticleExpert = await adapter.seoArticleExpertRepository.delete({
        where: { id }
      })
    }
    if (!seoArticleExpert) {
      throw new NotFoundError({
        code: 'EXPERT_NOT_FOUND'
      })
    }

    return seoArticleExpert
  }
}
