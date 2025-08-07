import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourney-discord-account'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.MidjourneyDiscordAccountFindFirstArgs,
) => Promise<IMidjourneyDiscordAccount | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const midjourneyDiscordAccount = (await db.client.midjourneyDiscordAccount.findFirst(
      data,
    )) as IMidjourneyDiscordAccount

    return midjourneyDiscordAccount
  }
}
