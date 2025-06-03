import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IChat } from '@/domain/entity/chat'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ChatFindManyArgs) => Promise<Array<IChat> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const chat = await db.client.chat.findMany(data)

    return chat
  }
}
