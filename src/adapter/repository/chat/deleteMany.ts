import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (data: Prisma.ChatDeleteManyArgs) => Promise<{ count: number } | never>

export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    const chat = await db.client.chat.deleteMany(data)

    return chat
  }
}
