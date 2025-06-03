import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleExpertJobHistory } from '@/domain/entity/seo-article-expert-job-history'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.SEOArticleExpertJobHistoryFindFirstArgs) => Promise<ISEOArticleExpertJobHistory | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.sEOArticleExpertJobHistory.findFirst(data)) as ISEOArticleExpertJobHistory

    return action
  }
}
