import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  data: Prisma.SEOArticleCategoryDeleteArgs,
) => Promise<ISEOArticleCategory | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.sEOArticleCategory.delete(data)
    return action
  }
}
