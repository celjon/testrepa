import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelProvider } from '@/domain/entity/model-provider'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.ModelProviderCreateArgs,
) => Promise<IModelProvider | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.modelProvider.create(data)) as IModelProvider
  }
}
