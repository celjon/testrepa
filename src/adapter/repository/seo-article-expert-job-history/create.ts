import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.SEOArticleExpertJobHistoryCreateArgs,
) => Promise<ISEOArticleExpertJobHistory | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const ExpertJobHistory = await db.client.sEOArticleExpertJobHistory.create(data)

    return ExpertJobHistory
  }
}
