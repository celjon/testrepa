import { Adapter, SEOArticleCategoryRepository } from '@/domain/types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type Paginate = (data: {
  query: Parameters<SEOArticleCategoryRepository['list']>[0]
  page: number
  quantity: number
}) => Promise<
  | {
      data: Array<ISEOArticleCategory>
      pages: number
      count: number
    }
  | never
>

export const buildPaginate = ({ seoArticleCategoryRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
        count: 0,
      }
    }

    const data = await seoArticleCategoryRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })
    let count = await seoArticleCategoryRepository.count({
      where: query?.where,
    })
    const pages = page ? Math.ceil(count / quantity) : 1
    return {
      data,
      pages,
      count,
    }
  }
}
