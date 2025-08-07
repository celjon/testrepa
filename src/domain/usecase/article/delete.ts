import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { IArticle } from '@/domain/entity/article'

export type Delete = (params: { id: string }) => Promise<IArticle>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let article = await adapter.articleRepository.get({ where: { id } })
    if (article) {
      article = await adapter.articleRepository.delete({
        where: { id },
      })
    }
    if (!article) {
      throw new NotFoundError({
        code: 'ARTICLE_NOT_FOUND',
      })
    }

    return article
  }
}
