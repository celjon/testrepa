import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  data: Prisma.SEOArticleExpertJobHistoryDeleteArgs,
) => Promise<ISEOArticleExpertJobHistory | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.sEOArticleExpertJobHistory.delete(data)

    return action
  }
}
