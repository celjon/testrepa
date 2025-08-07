import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelProvider } from '@/domain/entity/model-provider'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (
  data?: Prisma.ModelProviderUpsertArgs,
) => Promise<IModelProvider | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelProvider.upsert(data as any)) as IModelProvider
  }
}
