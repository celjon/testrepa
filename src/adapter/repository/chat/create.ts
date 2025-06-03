import { IChat } from '@/domain/entity/chat'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ChatCreateArgs) => Promise<IChat | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const chat = await db.client.chat.create(data)

    return chat
  }
}
