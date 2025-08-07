import { UseCaseParams } from '@/domain/usecase/types'
import { IArticle } from '@/domain/entity/article'

export type ListSEOArticles = (params: {
  search?: string
  page: number
  quantity: number
}) => Promise<
  | {
      data: IArticle[]
      pages: number
    }
  | never
>

export const buildListSEOArticles = ({ service }: UseCaseParams): ListSEOArticles => {
  return async ({ search, page, quantity }) => {
    const articles = await service.article.paginate({
      query: {
        where: {
          published_at: {
            not: null,
          },
          ...(search && {
            subject: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }),
        },
        include: {
          proofreadings: { include: { expert: true } },
          topics: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      page,
      quantity,
    })

    return articles
  }
}
