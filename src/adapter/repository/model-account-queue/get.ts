import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountQueue } from '@/domain/entity/model-account-queue'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.ModelAccountQueueFindFirstArgs,
) => Promise<IModelAccountQueue | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.modelAccountQueue.findFirst(data)) as IModelAccountQueue
  }
}
