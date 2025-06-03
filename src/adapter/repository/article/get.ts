import { AdapterParams } from '@/adapter/types'
import { IArticle } from '@/domain/entity/article'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ArticleFindFirstArgs) => Promise<IArticle | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.article.findFirst(data)) as IArticle

    return action
  }
}
