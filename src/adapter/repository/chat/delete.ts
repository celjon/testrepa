import { IChat } from '@/domain/entity/chat'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ChatDeleteArgs) => Promise<IChat | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const chat = await db.client.chat.delete(data)

    return chat
  }
}
