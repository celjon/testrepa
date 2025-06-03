import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleTopic, LocalizedName } from '@/domain/entity/seo-article-topic'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.SEOArticleTopicUpdateArgs) => Promise<ISEOArticleTopic | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const topic = await db.client.sEOArticleTopic.update(data)
    const validatedTopic: ISEOArticleTopic = {
      ...topic,
      name: topic.name as LocalizedName
    }
    return validatedTopic
  }
}
