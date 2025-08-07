import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (
  data: Prisma.MidjourneyDiscordAccountDeleteManyArgs,
) => Promise<Prisma.BatchPayload | never>

export const buildDeleteMany =
  ({ db }: Params): DeleteMany =>
  async (data) => {
    return db.client.midjourneyDiscordAccount.deleteMany(data)
  }
