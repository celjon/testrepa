import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IArticle } from '@/domain/entity/article'

type Params = Pick<AdapterParams, 'db'>

export type List = (params: Prisma.ArticleFindManyArgs) => Promise<Array<IArticle> | never>
export const buildList = ({ db }: Params): List => {
  return async (getParams) => {
    const article = (await db.client.article.findMany(getParams)) as Array<IArticle>

    return article
  }
}
