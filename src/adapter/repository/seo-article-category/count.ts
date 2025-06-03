import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params: Prisma.SEOArticleCategoryCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (args) => {
    const article = await db.client.sEOArticleCategory.count(args)

    return article
  }
}
