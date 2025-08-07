import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.ModelFindManyArgs) => Promise<Array<IModel> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.model.findMany({
      ...data,
      where: {
        deleted_at: null,
        ...(data ? data.where : {}),
      },
    })) as Array<IModel>
  }
}
