import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ModelFindFirstArgs) => Promise<IModel | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.model.findFirst({
      ...data,
      where: {
        deleted_at: null,
        ...data.where,
      },
    })) as IModel
  }
}
