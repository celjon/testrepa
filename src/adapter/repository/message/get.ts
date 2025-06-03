import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessage } from '@/domain/entity/message'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.MessageFindFirstArgs, tx?: unknown) => Promise<IMessage | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data, tx) => {
    return (await db.getContextClient(tx).message.findFirst(data)) as IMessage
  }
}
