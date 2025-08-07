import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccount } from '@/domain/entity/model-account'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ModelAccountUpdateArgs) => Promise<IModelAccount | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelAccount.update(data)
  }
}
