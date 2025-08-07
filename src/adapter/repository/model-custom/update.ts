import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/model-custom'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ModelCustomUpdateArgs) => Promise<IModelCustom | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelCustom.update(data)
  }
}
