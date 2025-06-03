import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.SEOArticleExpertDeleteArgs) => Promise<ISEOArticleExpert | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.sEOArticleExpert.delete(data)

    return action
  }
}
