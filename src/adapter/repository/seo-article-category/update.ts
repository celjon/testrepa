import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.SEOArticleCategoryUpdateArgs) => Promise<ISEOArticleCategory | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const category = await db.client.sEOArticleCategory.update(data)

    return category
  }
}
