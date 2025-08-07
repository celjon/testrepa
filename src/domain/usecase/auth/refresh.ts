import { JwtPayload } from 'jsonwebtoken'
import { verifyJWT } from '@/lib'
import { BanedUserError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Refresh = (data: { refreshToken: string; accessToken: string }) => Promise<
  | {
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildRefresh = ({ service, adapter }: UseCaseParams): Refresh => {
  return async ({ refreshToken, accessToken }) => {
    const isRefreshTokenValid = verifyJWT(refreshToken) as JwtPayload
    const userPayload = verifyJWT(accessToken, { ignoreExpiration: true }) as JwtPayload

    if (!isRefreshTokenValid || !userPayload?.id) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }
    const userId = userPayload.id

    const dbUser = await adapter.userRepository.get({
      where: {
        id: userId,
      },
      include: { refresh_tokens: true },
    })

    if (!dbUser || dbUser.disabled) {
      throw new BanedUserError({
        code: 'USER_NOT_FOUND_OR_BANNED',
      })
    }
    const currentToken = dbUser.refresh_tokens?.find((rt) => rt.token === refreshToken)

    if (!dbUser.refresh_tokens || !currentToken) {
      throw new NotFoundError({ code: 'REFRESH_TOKEN_NOT_FOUND' })
    }

    const { accessToken: newAT, refreshToken: newRT } = await service.auth.signAuthTokens({
      user: {
        id: userId,
      },
      keyEncryptionKey: userPayload.keyEncryptionKey ?? null,
    })

    await adapter.refreshTokenRepository.update({
      where: { id: currentToken.id },
      data: { token: newRT, updated_at: new Date() },
    })

    return {
      accessToken: newAT,
      refreshToken: newRT,
    }
  }
}
