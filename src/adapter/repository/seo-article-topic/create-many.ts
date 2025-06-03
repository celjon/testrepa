import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'

type Params = Pick<AdapterParams, 'db'>

export type CreateMany = (params: Array<Prisma.SEOArticleTopicCreateArgs>) => Promise<Array<ISEOArticleTopic> | never>
export const buildCreateMany = ({ db }: Params): CreateMany => {
  return async (data) => {
    const topics = (await db.client.$transaction(data.map((topic) => db.client.sEOArticleTopic.create(topic)))) as Array<ISEOArticleTopic>

    return topics
  }
}
