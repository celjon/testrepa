import { IChat } from '@/domain/entity/chat'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ChatUpdateArgs) => Promise<IChat | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.chat.update(data)

    return chat
  }
}
