import { Prisma } from '@prisma/client'
import { IModelUsageBucket } from '@/domain/entity/model-usage-bucket'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

type Upsert = (
  data?: Prisma.ModelUsageBucketUpsertArgs,
) => Promise<IModelUsageBucket | null | never>

type DeleteMany = (
  data: Prisma.ModelUsageBucketDeleteManyArgs,
) => Promise<Prisma.BatchPayload | never>

export type ModelUsageBucketRepository = {
  upsert: Upsert
  deleteMany: DeleteMany
}

export const buildModelUsageBucketRepository = ({ db }: Params): ModelUsageBucketRepository => {
  return {
    upsert: (data) => {
      // @ts-expect-error
      return db.client.modelUsageBucket.upsert(data)
    },
    deleteMany: (data) => {
      return db.client.modelUsageBucket.deleteMany(data)
    },
  }
}
