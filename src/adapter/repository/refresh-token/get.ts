import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IRefreshToken } from '@/domain/entity/refresh-token'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.RefreshTokenFindFirstArgs) => Promise<IRefreshToken | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const refreshToken = (await db.client.refreshToken.findFirst(data)) as IRefreshToken

    return refreshToken
  }
}
