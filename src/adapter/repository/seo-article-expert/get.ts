import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.SEOArticleExpertFindFirstArgs) => Promise<ISEOArticleExpert | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.sEOArticleExpert.findFirst(data)) as ISEOArticleExpert

    return action
  }
}
