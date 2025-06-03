import { ITransaction } from '@/domain/entity/transaction'
import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type UpdateTransaction = (data: Prisma.TransactionUpdateArgs) => Promise<ITransaction | never>

export const buildUpdateTransaction = ({ db }: Params): UpdateTransaction => {
  return async (data) => {
    const tranaction = (await db.client.transaction.update(data)) as ITransaction

    return tranaction
  }
}
