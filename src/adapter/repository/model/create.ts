import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ModelCreateArgs) => Promise<IModel | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.model.create(data)) as IModel
  }
}
