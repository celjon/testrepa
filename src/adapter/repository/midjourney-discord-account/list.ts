import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourneyDiscordAccount'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.MidjourneyDiscordAccountFindManyArgs) => Promise<Array<IMidjourneyDiscordAccount> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const midjourneyDiscordAccount = await db.client.midjourneyDiscordAccount.findMany(data)

    return midjourneyDiscordAccount
  }
}
