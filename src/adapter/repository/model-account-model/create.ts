import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/model-account-model'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.ModelAccountModelCreateArgs,
) => Promise<IModelAccountModel | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.modelAccountModel.create(data)) as IModelAccountModel
  }
}
