import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type SendResetLink = (data: {
  email: string
  metadata?: {
    locale?: string
  }
}) => Promise<void | never>
export const buildSendResetLink = ({ adapter, service }: UseCaseParams): SendResetLink => {
  return async ({ email, metadata }) => {
    const user = await adapter.userRepository.get({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })
    if (!user || !user.email) {
      throw new ForbiddenError({
        code: 'USER_NOT_REGISTERED',
      })
    }

    await service.auth.sendResetLink({ user, metadata })
  }
}
