import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccountQueue } from '@/domain/entity/model-account-queue'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (
  data?: Prisma.ModelAccountQueueUpsertArgs,
) => Promise<IModelAccountQueue | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelAccountQueue.upsert(data as any)) as IModelAccountQueue
  }
}
