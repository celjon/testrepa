import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelFunction } from '@/domain/entity/modelFunction'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ModelFunctionCreateArgs) => Promise<IModelFunction | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.modelFunction.create(data)) as IModelFunction
  }
}
