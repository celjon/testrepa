import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateMany = (data: Prisma.TransactionCreateManyArgs) => Promise<Prisma.BatchPayload | never>

export const buildCreateMany = ({ db }: Params): CreateMany => {
  return async (data) => {
    const tranaction = await db.client.transaction.createMany(data)

    return tranaction
  }
}
