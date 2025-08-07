import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/model-custom'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ModelCustomFindFirstArgs) => Promise<IModelCustom | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelCustom.findFirst(data)) as IModelCustom
  }
}
