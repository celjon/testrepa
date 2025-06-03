import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IAction } from '@/domain/entity/action'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ActionFindFirstArgs) => Promise<IAction | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const action = (await db.client.action.findFirst(data)) as IAction

    return action
  }
}
