import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IChatSettings } from '@/domain/entity/chatSettings'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.ChatSettingsUpsertArgs) => Promise<IChatSettings | null>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.chatSettings.upsert(data as any)) as IChatSettings
  }
}
