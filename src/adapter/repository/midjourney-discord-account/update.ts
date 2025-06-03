import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourneyDiscordAccount'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.MidjourneyDiscordAccountUpdateArgs) => Promise<IMidjourneyDiscordAccount | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const midjourneyDiscordAccount = await db.client.midjourneyDiscordAccount.update(data)

    return midjourneyDiscordAccount
  }
}
