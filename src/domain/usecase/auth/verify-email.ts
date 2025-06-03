import { InvalidDataError, NotFoundError, UnauthorizedError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type VerifyEmail = (data: { userId: string; verificationCode: string }) => Promise<void>

export const buildVerifyEmail = ({ adapter }: UseCaseParams): VerifyEmail => {
  return async ({ userId, verificationCode }) => {
    const code = await adapter.verificationCodeRepository.get({
      where: {
        code: verificationCode,
        user_id: userId
      },
      include: {
        user: true
      }
    })

    if (!code) {
      throw new NotFoundError({
        code: 'VERIFICATION_CODE_NOT_FOUND'
      })
    }

    if (new Date() > code.expires_at) {
      await adapter.verificationCodeRepository.delete({
        where: { id: code.id }
      })

      throw new InvalidDataError({
        code: 'VERIFICATION_CODE_EXPIRED'
      })
    }

    const user = code.user

    if (!user || user.disabled) {
      throw new UnauthorizedError()
    }

    await adapter.userRepository.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        inactive: false
      }
    })
    await adapter.verificationCodeRepository.delete({
      where: { id: code.id }
    })
  }
}
