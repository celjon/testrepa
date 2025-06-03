import { IJob } from '@/domain/entity/job'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.JobDeleteArgs) => Promise<IJob | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const job = await db.client.job.delete(data)

    return job as IJob
  }
}
