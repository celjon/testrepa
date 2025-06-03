import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IAction } from '@/domain/entity/action'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ActionFindManyArgs) => Promise<Array<IAction> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const action = await db.client.action.findMany(data)

    return action
  }
}
