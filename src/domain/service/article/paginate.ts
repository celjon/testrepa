import { Adapter, ArticleRepository } from '@/domain/types'
import { IArticle } from '@/domain/entity/article'

export type Paginate = (data: {
  query: Parameters<ArticleRepository['list']>[0]
  page: number
  quantity: number
}) => Promise<
  | {
      data: Array<IArticle>
      pages: number
    }
  | never
>

export const buildPaginate = ({ articleRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await articleRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })

    const pages = page
      ? Math.ceil(
          (await articleRepository.count({
            where: query?.where,
          })) / quantity,
        )
      : 1

    return {
      data,
      pages,
    }
  }
}
