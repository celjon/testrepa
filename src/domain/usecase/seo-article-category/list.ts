import { UseCaseParams } from '@/domain/usecase/types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type List = (params: { page: number; quantity: number }) => Promise<
  | {
      data: ISEOArticleCategory[]
      pages: number
      count: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ page, quantity }) => {
    const category = await service.seoArticleCategory.paginate({
      query: {
        where: {},
        include: {
          topics: true,
        },
      },
      page,
      quantity,
    })

    const data = category.data.map(({ id, name, slug, topics = [] }) => {
      const uniqueTopics = Array.from(new Map(topics.map((t) => [t.slug, t])).values())

      return { id, name, slug, topics: uniqueTopics }
    })

    return {
      data,
      pages: category.pages,
      count: category.count,
    }
  }
}
