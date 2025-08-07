import { IRefreshToken } from '@/domain/entity/refresh-token'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.RefreshTokenDeleteArgs) => Promise<IRefreshToken | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const refreshToken = await db.client.refreshToken.delete(data)

    return refreshToken
  }
}
