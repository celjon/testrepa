import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params?: Prisma.ModelProviderCountArgs) => Promise<number>

export const buildCount =
  ({ db }: Params): Count =>
  (params) =>
    db.client.modelProvider.count(params)
