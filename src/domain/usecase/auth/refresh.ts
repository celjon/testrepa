import { verifyJWT } from '@/lib'
import { JwtPayload } from 'jsonwebtoken'
import { UseCaseParams } from '../types'
import { IUser } from '@/domain/entity/user'
import { BanedUserError, NotFoundError } from '@/domain/errors'

export type Refresh = (data: { refreshToken: string }) => Promise<
  | {
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildRefresh = ({ service, adapter }: UseCaseParams): Refresh => {
  return async ({ refreshToken }) => {
    const user = verifyJWT(refreshToken) as JwtPayload

    if (!user?.id) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const dbUser = await adapter.userRepository.get({
      where: {
        id: user.id
      }
    })

    if (!dbUser || dbUser.disabled) {
      throw new BanedUserError()
    }

    const { accessToken, refreshToken: newRT } = await service.auth.signAuthTokens({
      user: {
        id: user.id
      } as IUser,
      keyEncryptionKey: user.keyEncryptionKey ?? null
    })

    return {
      accessToken,
      refreshToken: newRT
    }
  }
}
