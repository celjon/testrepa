import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountQueue } from '@/domain/entity/model-account-queue'

type Params = Pick<AdapterParams, 'db'>

export type Update = (
  data: Prisma.ModelAccountQueueUpdateArgs,
) => Promise<IModelAccountQueue | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.modelAccountQueue.update(data)
  }
}
