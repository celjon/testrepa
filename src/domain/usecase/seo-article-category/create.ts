import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'
import { slugification } from '@/lib/utils/text-slugification'

export type Create = (params: {
  name: { ru: string; en: string; es: string; fr: string; pt: string }
}) => Promise<ISEOArticleCategory>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ name }) => {
    const seoArticleCategory = await adapter.seoArticleCategoryRepository.create({
      data: { name, slug: slugification(name.en) },
    })

    if (!seoArticleCategory) {
      throw new NotFoundError({
        code: 'CATEGORY_NOT_FOUND',
      })
    }

    return seoArticleCategory
  }
}
