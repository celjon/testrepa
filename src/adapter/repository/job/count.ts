import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.JobCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    return db.client.job.count(data)
  }
}
