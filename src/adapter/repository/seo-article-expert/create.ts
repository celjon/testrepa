import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.SEOArticleExpertCreateArgs) => Promise<ISEOArticleExpert | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const Expert = await db.client.sEOArticleExpert.create(data)

    return Expert
  }
}
