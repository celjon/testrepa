import { IUser } from '@/domain/entity/user'
import { UnauthorizedError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { Register } from '@/domain/usecase/auth/register'

export type Authorize = (data: {
  email: string
  password: string
  isOrgJoin: boolean
  ip: string
  user_agent: string | null
  isAdminPanel?: boolean
}) => Promise<
  | {
      user: IUser
      accessToken: string
    }
  | never
>

export const buildAuthorize = ({
  service,
  adapter,
  registerFunc,
}: UseCaseParams & {
  registerFunc: Register
}): Authorize => {
  return async ({ email, password, isOrgJoin, ip, user_agent, isAdminPanel }) => {
    let user = await service.auth.checkCredentials({
      email,
      password,
    })
    if (isOrgJoin && !user) {
      const tempUser = await registerFunc({
        email: email,
        password: password,
        yandexMetricClientId: null,
        yandexMetricYclid: null,
        receiveEmails: false,
        autoVerified: true,
        ip,
      })
      user = tempUser.user
    }

    if (!user || user.disabled) {
      throw new UnauthorizedError()
    }

    user = (await adapter.userRepository.get({
      where: {
        id: user.id,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        employees: {
          include: {
            enterprise: {
              include: {
                subscription: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
      },
    })) as IUser

    if (user.email && !user.emailVerified) {
      throw new UnauthorizedError({
        code: 'EMAIL_NOT_VERIFIED',
      })
    }

    const keyEncryptionKey = user.kekSalt
      ? await adapter.cryptoGateway.deriveKEK({
          password: password,
          kekSalt: user.kekSalt,
        })
      : null

    const { accessToken, refreshToken } = await service.auth.signAuthTokens({
      user,
      keyEncryptionKey,
      short: isAdminPanel,
    })

    await adapter.refreshTokenRepository.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        ip,
        user_agent,
      },
    })

    user.encryptedDEK = null
    user.kekSalt = null
    user.password = null

    return {
      user,
      accessToken,
      refreshToken,
    }
  }
}
