import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params: Prisma.UserCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (args) => {
    const user = await db.client.user.count(args)

    return user
  }
}
