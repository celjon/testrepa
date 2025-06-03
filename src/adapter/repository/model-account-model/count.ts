import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params?: Prisma.ModelAccountModelCountArgs) => Promise<number>

export const buildCount =
  ({ db }: Params): Count =>
  (params) =>
    db.client.modelAccountModel.count(params)
