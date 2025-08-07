import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IUser } from '@/domain/entity/user'

export type ChangeEmail = (data: {
  userId: string
  newEmail: string
  password: string
  metadata?: {
    locale?: string
  }
}) => Promise<
  | {
      user: IUser
    }
  | never
>
export const buildChangeEmail = ({ service, adapter }: UseCaseParams): ChangeEmail => {
  return async ({ newEmail, userId, password, metadata }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    if (user.inactive || !user.email) {
      throw new ForbiddenError({
        code: 'USER_HAS_NO_EMAIL',
      })
    }

    const passwordsSame = await service.auth.checkCredentials({
      email: user.email,
      password,
    })

    if (!passwordsSame) {
      throw new ForbiddenError({
        code: 'PASSWORD_NOT_SAME',
      })
    }

    const maybeExistUser = await adapter.userRepository.get({
      where: { email: newEmail },
    })
    if (maybeExistUser) {
      throw new ForbiddenError({
        code: 'USER_FOUND',
      })
    }

    const oldEmail = await adapter.oldEmailRepository.get({
      where: {
        email: user.email,
      },
    })

    if (!oldEmail) {
      await adapter.oldEmailRepository.create({
        data: {
          email: user.email,
          user_id: user.id,
        },
      })
    }

    const userWithNewEmail = await adapter.userRepository.update({
      where: {
        id: user.id,
      },
      data: {
        email: newEmail,
        emailVerified: false,
      },
    })

    if (!userWithNewEmail) {
      throw new ForbiddenError()
    }

    await service.auth.sendVerificationCode({
      userId: userWithNewEmail.id,
      email: newEmail,
      locale: metadata?.locale,
    })

    return {
      user: userWithNewEmail,
    }
  }
}
