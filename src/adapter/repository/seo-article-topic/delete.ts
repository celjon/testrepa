import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleTopic, LocalizedName } from '@/domain/entity/seo-article-topic'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.SEOArticleTopicDeleteArgs) => Promise<ISEOArticleTopic | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const topic = await db.client.sEOArticleTopic.delete(data)
    const validatedTopic: ISEOArticleTopic = {
      ...topic,
      name: topic.name as LocalizedName,
    }
    return validatedTopic
  }
}
