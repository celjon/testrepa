import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateMany = (
  data: Prisma.SEOArticleProofreadingCreateManyArgs,
) => Promise<number | never>

export const buildCreateMany = ({ db }: Params): CreateMany => {
  return async (data) => {
    const result = await db.client.sEOArticleProofreading.createMany(data)

    return result.count
  }
}
