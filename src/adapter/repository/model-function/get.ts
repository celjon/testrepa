import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelFunction } from '@/domain/entity/model-function'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.ModelFunctionFindFirstArgs,
) => Promise<IModelFunction | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelFunction.findFirst(data)) as IModelFunction
  }
}
