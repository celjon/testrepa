import { IRefreshToken } from '@/domain/entity/refresh-token'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.RefreshTokenCreateArgs) => Promise<IRefreshToken | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const refreshToken = await db.client.refreshToken.create(data)

    return refreshToken
  }
}
