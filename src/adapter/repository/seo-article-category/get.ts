import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.SEOArticleCategoryFindFirstArgs) => Promise<ISEOArticleCategory | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.sEOArticleCategory.findFirst(data)) as ISEOArticleCategory

    return action
  }
}
