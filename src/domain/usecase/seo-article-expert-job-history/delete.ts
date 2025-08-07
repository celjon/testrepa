import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

export type Delete = (params: { id: string }) => Promise<ISEOArticleExpertJobHistory>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.get({
      where: { id },
    })
    if (seoArticleExpertJobHistory) {
      seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.delete({
        where: { id },
      })
    }
    if (!seoArticleExpertJobHistory) {
      throw new NotFoundError({
        code: 'EXPERT_EXPERIENCE_NOT_FOUND',
      })
    }

    return seoArticleExpertJobHistory
  }
}
