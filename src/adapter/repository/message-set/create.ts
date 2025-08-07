import { AdapterParams } from '@/adapter/types'
import { IMessageSet } from '@/domain/entity/message-set'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.MessageSetCreateArgs, tx?: unknown) => Promise<IMessageSet>

export const buildCreate = ({ db }: Params): Create => {
  return async (data, tx) => {
    return db.getContextClient(tx).messageSet.create(data)
  }
}
