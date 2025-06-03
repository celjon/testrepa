import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourneyDiscordAccount'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.MidjourneyDiscordAccountCreateArgs) => Promise<IMidjourneyDiscordAccount | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const midjourneyDiscordAccount = await db.client.midjourneyDiscordAccount.create(data)

    return midjourneyDiscordAccount
  }
}
