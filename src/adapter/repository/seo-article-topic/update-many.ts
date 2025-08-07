import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (
  data: Prisma.SEOArticleTopicUpdateManyArgs,
  tx?: unknown,
) => Promise<Prisma.BatchPayload | never>

export const buildUpdateMany = ({ db }: Params, tx?: unknown): UpdateMany => {
  return async (data) => {
    const action = await db.getContextClient(tx).sEOArticleTopic.updateMany(data)

    return action
  }
}
