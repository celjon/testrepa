import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/model-account-model'

type Params = Pick<AdapterParams, 'db'>

export type Update = (
  data: Prisma.ModelAccountModelUpdateArgs,
) => Promise<IModelAccountModel | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelAccountModel.update(data)
  }
}
