import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IChat } from '@/domain/entity/chat'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.ChatUpsertArgs) => Promise<IChat | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.chat.upsert(data as any)) as IChat
  }
}
