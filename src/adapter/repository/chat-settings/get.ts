import { IChatSettings } from '@/domain/entity/chat-settings'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ChatSettingsFindFirstArgs) => Promise<IChatSettings | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const settings = (await db.client.chatSettings.findFirst(data)) as IChatSettings

    return settings
  }
}
