import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type Get = (params: { id: string }) => Promise<ISEOArticleCategory>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const seoArticleCategory = await adapter.seoArticleCategoryRepository.get({
      where: { id },
    })

    if (!seoArticleCategory) {
      throw new NotFoundError({
        code: 'CATEGORY_NOT_FOUND',
      })
    }

    return seoArticleCategory
  }
}
