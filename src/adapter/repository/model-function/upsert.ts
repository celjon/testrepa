import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelFunction } from '@/domain/entity/model-function'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (
  data?: Prisma.ModelFunctionUpsertArgs,
) => Promise<IModelFunction | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelFunction.upsert(data as any)) as IModelFunction
  }
}
