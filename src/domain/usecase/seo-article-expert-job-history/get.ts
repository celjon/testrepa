import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

export type Get = (params: { id: string }) => Promise<ISEOArticleExpertJobHistory>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.get({
      where: { id },
    })

    if (!seoArticleExpertJobHistory) {
      throw new NotFoundError({
        code: 'EXPERT_EXPERIENCE_NOT_FOUND',
      })
    }

    return seoArticleExpertJobHistory
  }
}
