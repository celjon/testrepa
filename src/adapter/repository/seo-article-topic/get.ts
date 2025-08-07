import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.SEOArticleTopicFindFirstArgs,
) => Promise<ISEOArticleTopic | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.sEOArticleTopic.findFirst(data)) as ISEOArticleTopic

    return action
  }
}
