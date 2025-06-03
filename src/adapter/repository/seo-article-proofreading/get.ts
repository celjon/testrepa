import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.SEOArticleProofreadingFindFirstArgs) => Promise<ISEOArticleProofreading | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.sEOArticleProofreading.findFirst(data)) as ISEOArticleProofreading

    return action
  }
}
