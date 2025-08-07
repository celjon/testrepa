import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type SendVerifyUpdating = (data: {
  userId: string
  email: string
  metadata?: {
    locale?: string
  }
}) => Promise<void>

export const buildSendVerifyUpdating = ({
  service,
  adapter,
}: UseCaseParams): SendVerifyUpdating => {
  return async ({ userId, email, metadata }) => {
    const user = await adapter.userRepository.get({
      omit: {
        kekSalt: true,
        encryptedDEK: true,
        password: true,
      },
      where: {
        id: userId,
      },
    })
    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }
    await Promise.all([
      service.auth.sendVerificationUpdateCode({
        userId: user.id,
        email: email,
        locale: metadata?.locale,
      }),
    ])
  }
}
