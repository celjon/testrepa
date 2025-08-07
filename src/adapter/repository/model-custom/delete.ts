import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/model-custom'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ModelCustomDeleteArgs) => Promise<IModelCustom | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const modelCustom = await db.client.modelCustom.delete(data)

    return modelCustom
  }
}
