import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.TransactionFindManyArgs) => Promise<Array<ITransaction> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.transaction.findMany(data)) as Array<ITransaction>
  }
}
