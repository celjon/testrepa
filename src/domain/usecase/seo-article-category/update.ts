import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { slugification } from '@/lib/utils/text-slugification'

export type Update = (params: {
  id: string
  name: {
    ru?: string
    en?: string
    es?: string
    fr?: string
    pt?: string
  }
}) => Promise<ISEOArticleCategory>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ id, name }) => {
    let seoArticleCategory = await adapter.seoArticleCategoryRepository.get({ where: { id } })
    if (seoArticleCategory) {
      seoArticleCategory = await adapter.seoArticleCategoryRepository.update({
        where: { id: id },
        data: {
          name,
          slug: name.ru ? slugification(name.ru) : undefined
        }
      })
    }
    if (!seoArticleCategory) {
      throw new NotFoundError({
        code: 'CATEGORY_NOT_FOUND'
      })
    }

    return seoArticleCategory
  }
}
