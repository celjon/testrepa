import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelFunction } from '@/domain/entity/modelFunction'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.ModelFunctionFindManyArgs) => Promise<Array<IModelFunction> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelFunction.findMany(data)) as Array<IModelFunction>
  }
}
