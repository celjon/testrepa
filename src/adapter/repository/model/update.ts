import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ModelUpdateArgs) => Promise<IModel | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return (await db.client.model.update(data)) as IModel
  }
}
