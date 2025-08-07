import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

type Params = Pick<AdapterParams, 'db'>

export type Update = (
  data: Prisma.SEOArticleExpertJobHistoryUpdateArgs,
) => Promise<ISEOArticleExpertJobHistory | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.sEOArticleExpertJobHistory.update(data)

    return chat
  }
}
