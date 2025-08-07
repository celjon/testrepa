import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  params: Prisma.SEOArticleCategoryFindManyArgs,
) => Promise<Array<ISEOArticleCategory> | never>
export const buildList = ({ db }: Params): List => {
  return async (getParams) => {
    const article = (await db.client.sEOArticleCategory.findMany(
      getParams,
    )) as Array<ISEOArticleCategory>

    return article
  }
}
