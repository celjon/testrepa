import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.SEOArticleCategoryCreateArgs) => Promise<ISEOArticleCategory | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const category = await db.client.sEOArticleCategory.create(data)
    return category
  }
}
