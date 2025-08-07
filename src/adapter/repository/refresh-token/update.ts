import { IRefreshToken } from '@/domain/entity/refresh-token'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.RefreshTokenUpdateArgs) => Promise<IRefreshToken | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const refreshToken = await db.client.refreshToken.update(data)

    return refreshToken
  }
}
