import { IChatSettings } from '@/domain/entity/chatSettings'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ChatSettingsUpdateArgs) => Promise<IChatSettings | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const settings = await db.client.chatSettings.update(data)

    return settings
  }
}
