import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.SEOArticleProofreadingUpdateArgs) => Promise<ISEOArticleProofreading | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.sEOArticleProofreading.update(data)

    return chat
  }
}
