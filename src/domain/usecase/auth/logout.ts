import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Logout = (params: { userId: string; refreshToken: string }) => Promise<void>

export const buildLogout = ({ adapter }: UseCaseParams): Logout => {
  return async ({ userId, refreshToken }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
      include: { refresh_tokens: true },
    })

    if (!user) {
      throw new InvalidDataError({
        code: 'USER_NOT_FOUND',
      })
    }
    const currentToken = user.refresh_tokens?.find((rt) => rt.token === refreshToken)

    if (!user.refresh_tokens || !currentToken) {
      throw new NotFoundError({
        code: 'REFRESH_TOKEN_NOT_FOUND',
      })
    }
    await adapter.refreshTokenRepository.delete({
      where: { id: currentToken.id },
    })
  }
}
