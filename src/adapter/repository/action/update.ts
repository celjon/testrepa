import { IAction } from '@/domain/entity/action'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ActionUpdateArgs) => Promise<IAction | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const action = await db.client.action.update(data)

    return action
  }
}
