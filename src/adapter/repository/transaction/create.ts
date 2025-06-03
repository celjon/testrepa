import { ITransaction } from '@/domain/entity/transaction'
import { Prisma } from '@prisma/client'
import { AdapterParams, UnknownTx } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateTransaction = (data: Prisma.TransactionCreateArgs, tx?: UnknownTx) => Promise<ITransaction | never>

export const buildCreateTransaction = ({ db }: Params): CreateTransaction => {
  return async (data, tx) => {
    const transaction = (await db.getContextClient(tx).transaction.create(data)) as ITransaction

    return transaction
  }
}
