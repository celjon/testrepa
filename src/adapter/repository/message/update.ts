import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessage } from '@/domain/entity/message'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.MessageUpdateArgs, tx?: unknown) => Promise<IMessage | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data, tx) => {
    return db.getContextClient(tx).message.update(data) as unknown as IMessage
  }
}
