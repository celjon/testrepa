import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/modelCustom'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ModelCustomCreateArgs) => Promise<IModelCustom | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.modelCustom.create(data)) as IModelCustom
  }
}
