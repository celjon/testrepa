import { InvalidDataError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type LogoutAll = (params: { userId: string }) => Promise<void>

export const buildLogoutAll = ({ adapter }: UseCaseParams): LogoutAll => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new InvalidDataError({
        code: 'USER_NOT_FOUND',
      })
    }

    await adapter.refreshTokenRepository.deleteMany({
      where: { user_id: userId },
    })
  }
}
