import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccount } from '@/domain/entity/model-account'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ModelAccountCreateArgs) => Promise<IModelAccount | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return db.client.modelAccount.create(data)
  }
}
