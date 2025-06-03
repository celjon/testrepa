import { AdapterParams, UnknownTx } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IArticle } from '@/domain/entity/article'

type Params = Pick<AdapterParams, 'db'>

export type FindMany = (data: Prisma.ArticleFindManyArgs, tx?: UnknownTx) => Promise<IArticle[] | never>
export const buildFindMany = ({ db }: Params): FindMany => {
  return async (data, tx) => {
    return db.getContextClient(tx).article.findMany(data)
  }
}
