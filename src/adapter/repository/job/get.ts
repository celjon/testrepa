import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IJob } from '@/domain/entity/job'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.JobFindFirstArgs) => Promise<IJob | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const job = await db.client.job.findFirst(data)

    return job as IJob
  }
}
