import { IJob } from '@/domain/entity/job'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.JobUpdateArgs) => Promise<IJob | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const job = await db.client.job.update(data)

    return job as IJob
  }
}
