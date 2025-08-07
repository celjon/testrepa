import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Update = (params: {
  id: string
  post?: string
  from_date?: Date
  to_date?: Date
  company?: string
  city?: string
  duties?: string[]
  achievements?: string[]
  description?: string
  seo_expert_id?: string
}) => Promise<ISEOArticleExpertJobHistory>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({
    id,
    post,
    from_date,
    to_date,
    company,
    city,
    duties,
    achievements,
    description,
    seo_expert_id,
  }) => {
    let seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.get({
      where: { id },
    })
    if (seoArticleExpertJobHistory) {
      seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.update({
        where: { id: id },
        data: {
          post,
          from_date,
          to_date,
          company,
          city,
          duties,
          achievements,
          description,
          seo_expert_id,
        },
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
