import { IArticle } from '@/domain/entity/article'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Update = (params: {
  userId: string
  id: string
  content: string
  published_at: Date
}) => Promise<IArticle>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ userId, id, content, published_at }) => {
    const article = await adapter.articleRepository.update({
      where: { id: id, user_id: userId },
      data: {
        content,
        published_at,
      },
      include: {
        model: true,
      },
    })

    if (!article) {
      throw new NotFoundError({
        code: 'ARTICLE_NOT_FOUND',
      })
    }

    return article
  }
}
