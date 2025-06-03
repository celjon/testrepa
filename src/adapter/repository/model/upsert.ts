import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.ModelUpsertArgs) => Promise<IModel | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.model.upsert(data as any)) as IModel
  }
}
