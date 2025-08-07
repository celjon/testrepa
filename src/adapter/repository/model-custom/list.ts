import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/model-custom'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.ModelCustomFindManyArgs) => Promise<Array<IModelCustom> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelCustom.findMany(data)) as Array<IModelCustom>
  }
}
