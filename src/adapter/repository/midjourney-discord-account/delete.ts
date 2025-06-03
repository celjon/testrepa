import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourneyDiscordAccount'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.MidjourneyDiscordAccountDeleteArgs) => Promise<IMidjourneyDiscordAccount | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const midjourneyDiscordAccount = await db.client.midjourneyDiscordAccount.delete(data)

    return midjourneyDiscordAccount
  }
}
