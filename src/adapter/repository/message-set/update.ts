import { AdapterParams } from '@/adapter/types'
import { IMessageSet } from '@/domain/entity/messageSet'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.MessageSetUpdateArgs, tx?: unknown) => Promise<IMessageSet>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data, tx) => {
    return db.getContextClient(tx).messageSet.update(data)
  }
}
