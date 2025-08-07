import { IArticle } from '@/domain/entity/article'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Get = (params: { articleId: string; userId: string }) => Promise<IArticle>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ articleId, userId }) => {
    const article = await adapter.articleRepository.get({
      where: { id: articleId, user_id: userId },
      include: {
        proofreadings: true,
        topics: {
          include: {
            category: true,
          },
        },
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
