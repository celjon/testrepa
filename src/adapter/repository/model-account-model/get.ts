import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/modelAccountModel'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ModelAccountModelFindFirstArgs) => Promise<IModelAccountModel | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelAccountModel.findFirst(data)) as IModelAccountModel
  }
}
