import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type GroupByTransaction = (
  data: Prisma.TransactionGroupByArgs & {
    orderBy: Prisma.TransactionOrderByWithAggregationInput | undefined
  }
) => Promise<Prisma.TransactionGroupByOutputType[]>

export const buildGroupByTransaction = ({ db }: Params): GroupByTransaction => {
  return async (data) => {
    const transactions = await db.client.transaction.groupBy(data)

    return transactions as Prisma.TransactionGroupByOutputType[]
  }
}
