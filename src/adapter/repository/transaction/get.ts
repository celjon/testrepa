import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'

type Params = Pick<AdapterParams, 'db'>

export type GetTransaction = (data: Prisma.TransactionFindFirstArgs) => Promise<ITransaction | null | never>
export const buildGetTransaction = ({ db }: Params): GetTransaction => {
  return async (data) => {
    return (await db.client.transaction.findFirst(data)) as ITransaction
  }
}
