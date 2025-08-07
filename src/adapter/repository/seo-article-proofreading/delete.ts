import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  data: Prisma.SEOArticleProofreadingDeleteArgs,
) => Promise<ISEOArticleProofreading | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.sEOArticleProofreading.delete(data)

    return action
  }
}
