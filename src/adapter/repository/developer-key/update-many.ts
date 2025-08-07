import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (
  data: Prisma.DeveloperKeyUpdateManyArgs,
) => Promise<{ count: number } | never>

export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data) => {
    const keys = await db.client.developerKey.updateMany(data)

    return keys
  }
}
