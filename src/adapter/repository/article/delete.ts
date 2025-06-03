import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IArticle } from '@/domain/entity/article'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ArticleDeleteArgs) => Promise<IArticle | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.article.delete(data)

    return action
  }
}
