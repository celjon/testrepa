import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleTopic, LocalizedName } from '@/domain/entity/seo-article-topic'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.SEOArticleTopicCreateArgs) => Promise<ISEOArticleTopic | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const topic = await db.client.sEOArticleTopic.create(data)
    const validatedTopic: ISEOArticleTopic = {
      ...topic,
      name: topic.name as LocalizedName
    }
    return validatedTopic
  }
}
