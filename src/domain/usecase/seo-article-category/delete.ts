import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type Delete = (params: { id: string }) => Promise<ISEOArticleCategory>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let seoArticleCategory = await adapter.seoArticleCategoryRepository.get({ where: { id } })
    if (seoArticleCategory) {
      seoArticleCategory = await adapter.seoArticleCategoryRepository.delete({
        where: { id },
      })
    }
    if (!seoArticleCategory) {
      throw new NotFoundError({
        code: 'CATEGORY_NOT_FOUND',
      })
    }

    return seoArticleCategory
  }
}
