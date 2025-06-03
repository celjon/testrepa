import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IArticle } from '@/domain/entity/article'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ArticleUpdateArgs) => Promise<IArticle | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.article.update(data)

    return chat
  }
}
