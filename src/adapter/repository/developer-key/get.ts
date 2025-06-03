import { IDeveloperKey } from '@/domain/entity/developerKey'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.DeveloperKeyFindFirstArgs) => Promise<IDeveloperKey | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const key = await db.client.developerKey.findFirst(data)

    return key
  }
}
