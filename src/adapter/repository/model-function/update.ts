import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelFunction } from '@/domain/entity/modelFunction'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ModelFunctionUpdateArgs) => Promise<IModelFunction | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelFunction.update(data)
  }
}
