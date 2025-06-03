import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (params: Prisma.GroupDeleteManyArgs) => Promise<{ count: number } | never>
export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (params) => {
    const data = await db.client.group.deleteMany(params)

    return data
  }
}
