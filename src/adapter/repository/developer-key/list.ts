import { IDeveloperKey } from '@/domain/entity/developer-key'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.DeveloperKeyFindManyArgs) => Promise<Array<IDeveloperKey>>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const keys = await db.client.developerKey.findMany(data)

    return keys
  }
}
