import { IDeveloperKey } from '@/domain/entity/developer-key'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.DeveloperKeyUpdateArgs) => Promise<IDeveloperKey | null | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const key = await db.client.developerKey.update(data)

    return key
  }
}
