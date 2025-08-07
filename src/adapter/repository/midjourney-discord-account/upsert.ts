import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourney-discord-account'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (
  data?: Prisma.MidjourneyDiscordAccountUpsertArgs,
) => Promise<IMidjourneyDiscordAccount | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.midjourneyDiscordAccount.upsert(
      data as any,
    )) as IMidjourneyDiscordAccount
  }
}
