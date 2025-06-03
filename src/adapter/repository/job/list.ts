import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IJob } from '@/domain/entity/job'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.JobFindManyArgs) => Promise<Array<IJob> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const jobs = await db.client.job.findMany(data)

    return jobs as IJob[]
  }
}
