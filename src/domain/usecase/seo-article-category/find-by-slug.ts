import { UseCaseParams } from '../types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type FindBySlug = (params: { slug: string }) => Promise<ISEOArticleCategory | null>

export const buildFindBySlug = ({ adapter }: UseCaseParams): FindBySlug => {
  return async ({ slug }) => {
    const category = await adapter.seoArticleCategoryRepository.get({
      where: { slug: slug },
      include: {
        topics: true,
      },
    })

    return category
  }
}
