import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params?: Prisma.ModelAccountCountArgs) => Promise<number>

export const buildCount =
  ({ db }: Params): Count =>
  (params) =>
    db.client.modelAccount.count(params)
