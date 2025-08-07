import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountQueue } from '@/domain/entity/model-account-queue'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.ModelAccountQueueCreateArgs,
) => Promise<IModelAccountQueue | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.modelAccountQueue.create(data)) as IModelAccountQueue
  }
}
