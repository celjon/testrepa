import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccount } from '@/domain/entity/model-account'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ModelAccountFindFirstArgs) => Promise<IModelAccount | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelAccount.findFirst(data)) as IModelAccount
  }
}
