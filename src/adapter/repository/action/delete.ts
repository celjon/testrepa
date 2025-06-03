import { IAction } from '@/domain/entity/action'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ActionDeleteArgs) => Promise<IAction | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const action = await db.client.action.delete(data)

    return action
  }
}
