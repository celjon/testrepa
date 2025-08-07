import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelProvider } from '@/domain/entity/model-provider'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.ModelProviderFindFirstArgs,
) => Promise<IModelProvider | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelProvider.findFirst(data)) as IModelProvider
  }
}
