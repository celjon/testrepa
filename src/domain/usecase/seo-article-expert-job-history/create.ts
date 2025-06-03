import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

export type Create = (params: {
  post: string
  from_date: Date
  to_date: Date
  company: string
  city: string
  duties: string[]
  achievements: string[]
  description: string
  seo_expert_id: string
}) => Promise<ISEOArticleExpertJobHistory>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ post, from_date, to_date, company, city, duties, achievements, description, seo_expert_id }) => {
    const seoArticleExpertJobHistory = await adapter.seoArticleExpertJobHistoryRepository.create({
      data: { post, from_date, to_date, company, city, duties, achievements, description, seo_expert_id }
    })

    if (!seoArticleExpertJobHistory) {
      throw new NotFoundError({
        code: 'EXPERT_EXPERIENCE_NOT_FOUND'
      })
    }

    return seoArticleExpertJobHistory
  }
}
