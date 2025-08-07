import { AdapterParams } from '@/adapter/types'
import { IModelAccount } from '@/domain/entity/model-account'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ModelAccountDeleteArgs) => Promise<IModelAccount | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    return db.client.modelAccount.delete(data)
  }
}
