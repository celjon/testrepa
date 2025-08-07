import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/model-account-model'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (
  data?: Prisma.ModelAccountModelUpsertArgs,
) => Promise<IModelAccountModel | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelAccountModel.upsert(data as any)) as IModelAccountModel
  }
}
