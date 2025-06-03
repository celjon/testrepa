import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.SEOArticleExpertUpdateArgs) => Promise<ISEOArticleExpert | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.sEOArticleExpert.update(data)

    return chat
  }
}
