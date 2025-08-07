import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (
  data: Prisma.MessageDeleteManyArgs,
) => Promise<{ count: number } | null | never>

export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    return db.client.message.deleteMany(data)
  }
}
