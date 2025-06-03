import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelCustom } from '@/domain/entity/modelCustom'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.ModelCustomUpsertArgs) => Promise<IModelCustom | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.modelCustom.upsert(data as any)) as IModelCustom
  }
}
