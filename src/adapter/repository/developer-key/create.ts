import { IDeveloperKey } from '@/domain/entity/developer-key'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.DeveloperKeyCreateArgs) => Promise<IDeveloperKey>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const model = await db.client.developerKey.create(data)

    return model
  }
}
