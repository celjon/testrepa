import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IArticle } from '@/domain/entity/article'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ArticleCreateArgs) => Promise<IArticle | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const article = await db.client.article.create(data)

    return article
  }
}
