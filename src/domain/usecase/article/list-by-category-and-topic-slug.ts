import { UseCaseParams } from '@/domain/usecase/types'
import { IArticle } from '@/domain/entity/article'

export type ListSEOArticlesByTopicSlug = (params: {
  categorySlug: string
  topicSlug: string
  page: number
  quantity: number
}) => Promise<
  | {
      data: IArticle[]
      pages: number
    }
  | never
>

export const buildListSEOArticlesByTopicSlug = ({
  service,
}: UseCaseParams): ListSEOArticlesByTopicSlug => {
  return async ({ categorySlug, topicSlug, page, quantity }) => {
    const articles = await service.article.paginate({
      query: {
        where: {
          published_at: {
            not: null,
          },
          topics: {
            some: {
              AND: [
                {
                  slug: { equals: topicSlug, mode: 'insensitive' },
                },
                {
                  category: {
                    slug: { equals: categorySlug, mode: 'insensitive' },
                  },
                },
              ],
            },
          },
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
