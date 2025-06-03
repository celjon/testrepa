import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IChatSettings } from '@/domain/entity/chatSettings'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ChatSettingsCreateArgs) => Promise<IChatSettings | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const settings = await db.client.chatSettings.create(data)

    return settings
  }
}
