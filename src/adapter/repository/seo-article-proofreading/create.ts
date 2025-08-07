import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleProofreading } from '@/domain/entity/seo-article-proofreading'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.SEOArticleProofreadingCreateArgs,
) => Promise<ISEOArticleProofreading | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const article = await db.client.sEOArticleProofreading.create(data)

    return article
  }
}
