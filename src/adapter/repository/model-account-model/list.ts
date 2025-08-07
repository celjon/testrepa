import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/model-account-model'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  data?: Prisma.ModelAccountModelFindManyArgs,
) => Promise<Array<IModelAccountModel> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelAccountModel.findMany(data)) as Array<IModelAccountModel>
  }
}
