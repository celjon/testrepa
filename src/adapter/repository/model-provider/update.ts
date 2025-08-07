import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelProvider } from '@/domain/entity/model-provider'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ModelProviderUpdateArgs) => Promise<IModelProvider | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelProvider.update(data)
  }
}
