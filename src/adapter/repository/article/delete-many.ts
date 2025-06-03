import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (data: Prisma.ArticleDeleteManyArgs) => Promise<number | never>

export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    const result = await db.client.article.deleteMany(data)

    return result.count
  }
}
