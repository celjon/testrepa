import { UseCaseParams } from '@/domain/usecase/types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

export type List = (params: { page: number; quantity: number }) => Promise<
  | {
      data: ISEOArticleCategory[]
      pages: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ page, quantity }) => {
    const category = await service.seoArticleCategory.paginate({
      query: {
        where: {},
        include: {
          topics: true
        }
      },
      page,
      quantity
    })

    return category
  }
}
