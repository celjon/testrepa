import { IJob } from '@/domain/entity/job'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.JobCreateArgs) => Promise<IJob | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const job = await db.client.job.create(data)

    return job as IJob
  }
}
