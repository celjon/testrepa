import { IArticle } from '@/domain/entity/article'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type FindBySlug = (params: { slug: string }) => Promise<IArticle>

export const buildFindBySlug = ({ adapter }: UseCaseParams): FindBySlug => {
  return async ({ slug }) => {
    const article = await adapter.articleRepository.get({
      where: { slug: slug },
      include: {
        proofreadings: { include: { expert: true } },
        topics: {
          include: {
            category: true
          }
        },
        model: true
      }
    })

    if (!article) {
      throw new NotFoundError({
        code: 'ARTICLE_NOT_FOUND'
      })
    }

    return article
  }
}
