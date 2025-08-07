import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (
  data: Prisma.RefreshTokenDeleteManyArgs,
) => Promise<{ count: number } | never>

export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    const refreshToken = await db.client.refreshToken.deleteMany(data)

    return refreshToken
  }
}
