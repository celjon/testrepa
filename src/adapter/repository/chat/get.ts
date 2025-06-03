import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IChat } from '@/domain/entity/chat'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ChatFindFirstArgs) => Promise<IChat | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const chat = (await db.client.chat.findFirst(data)) as IChat

    return chat
  }
}
