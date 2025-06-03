import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.TransactionCountArgs) => Promise<number>

export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    return db.client.transaction.count(data)
  }
}
