import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccount } from '@/domain/entity/model-account'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.ModelAccountUpsertArgs) => Promise<IModelAccount | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelAccount.upsert(data as any)) as IModelAccount
  }
}
