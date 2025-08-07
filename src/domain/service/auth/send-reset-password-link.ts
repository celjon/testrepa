import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { IUser } from '@/domain/entity/user'
import { Adapter } from '@/domain/types'
import { ForbiddenError } from '@/domain/errors'

export type SendResetPasswordLink = (params: {
  user: IUser
  metadata?: {
    locale?: string
  }
}) => Promise<void | never>

export const buildSendResetLink = ({ mailGateway }: Adapter): SendResetPasswordLink => {
  return async ({ user, metadata }) => {
    if (!user.email) {
      throw new ForbiddenError({
        code: 'USER_NOT_REGISTERED',
      })
    }

    const secret = config.jwt.secret + user.password

    const token = jwt.sign(
      {
        userId: user.id,
      },
      secret as string,
      {
        expiresIn: '15m',
      },
    )

    await mailGateway.sendPasswordRecoveryMail({
      to: user.email,
      token,
      locale: metadata?.locale,
    })

    return
  }
}
