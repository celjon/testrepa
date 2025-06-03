import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

export type Get = (params: { id: string }) => Promise<ISEOArticleExpert>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const seoArticleExpert = await adapter.seoArticleExpertRepository.get({
      where: { id },
      include: { experience: true }
    })

    if (!seoArticleExpert) {
      throw new NotFoundError({
        code: 'EXPERT_NOT_FOUND'
      })
    }

    return seoArticleExpert
  }
}
