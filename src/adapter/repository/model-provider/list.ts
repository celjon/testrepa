import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelProvider } from '@/domain/entity/modelProvider'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.ModelProviderFindManyArgs) => Promise<Array<IModelProvider> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelProvider.findMany(data)) as Array<IModelProvider>
  }
}
