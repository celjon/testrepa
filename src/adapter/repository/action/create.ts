import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IAction } from '@/domain/entity/action'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ActionCreateArgs, tx?: unknown) => Promise<IAction | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data, tx) => {
    const chat = await db.getContextClient(tx).action.create(data)

    return chat
  }
}
