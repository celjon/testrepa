import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountQueue } from '@/domain/entity/model-account-queue'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  data?: Prisma.ModelAccountQueueFindManyArgs,
) => Promise<Array<IModelAccountQueue> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelAccountQueue.findMany(data)) as Array<IModelAccountQueue>
  }
}
