import { AuthProviderType, Platform, Prisma } from '@prisma/client'
import { ForbiddenError, InternalError, InvalidDataError, UnauthorizedError } from '@/domain/errors'
import { IUser } from '@/domain/entity/user'
import { actions } from '@/domain/entity/action'
import { UseCaseParams } from '@/domain/usecase/types'

export type OAuthAuthorize = (params: {
  provider: string
  code: string
  device_id: string
  code_verifier?: string
  redirect_uri: string
  invitedBy?: string
  fingerprint?: string
  ip: string
  email?: string
  name?: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
  user_agent: string | null
  metadata?: {
    locale?: string
  }
  isAdminPanel?: boolean
  appPlatform?: 'ios-app-store'
  identityToken?: string
}) => Promise<
  | {
      user: IUser
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildOAuthAuthorize = ({ service, adapter }: UseCaseParams): OAuthAuthorize => {
  return async ({
    provider,
    code,
    device_id,
    code_verifier,
    redirect_uri,
    invitedBy,
    fingerprint,
    metadata,
    ip,
    email,
    name,
    yandexMetricClientId,
    yandexMetricYclid,
    user_agent,
    isAdminPanel,
    appPlatform,
    identityToken,
  }) => {
    const oauthUser = await adapter.authRepository.verifyOAuth({
      provider,
      code,
      device_id,
      code_verifier,
      redirect_uri,
      email,
      name,
      appPlatform,
      identityToken,
    })

    if (!oauthUser) {
      throw new InvalidDataError({
        code: 'TOKEN_INVALID',
      })
    }

    if (!oauthUser.email && !oauthUser.tg_id && !oauthUser.external_id) {
      throw new UnauthorizedError()
    }

    let filter: Prisma.UserWhereInput = { email: oauthUser.email?.toLowerCase() }
    if (provider === 'apple') {
      // do not use email to find user, because email is sent only once on first sign in. Email and name are sent from frontend app
      filter = {
        authProviders: {
          some: {
            external_id: oauthUser.external_id,
          },
        },
      }
    } else if (provider === 'telegram') {
      filter = { tg_id: oauthUser.tg_id }
    }

    let user = await adapter.userRepository.get({
      where: filter,
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
    })

    const region = await service.geo.determinePaymentRegion({ ip })

    // Register user
    if (!user) {
      if (provider === 'apple' && !oauthUser.email) {
        throw new ForbiddenError({
          code: 'NO_EMAIL',
          message: `No email provided`,
        })
      }

      if (provider === 'apple') {
        const userWithTheSameEmail = await adapter.userRepository.get({
          where: { email: oauthUser.email?.toLowerCase() },
        })

        if (userWithTheSameEmail) {
          throw new ForbiddenError({
            code: 'CREDENTIALS_TAKEN',
            message: `User with email ${oauthUser.email} already exists`,
          })
        }
      }

      let anonymousUser: IUser | null = null

      if (fingerprint) {
        anonymousUser = await adapter.userRepository.get({
          where: {
            anonymousDeviceFingerprint: fingerprint,
          },
          include: {
            subscription: true,
          },
        })
      }

      user = await service.user.initialize(
        oauthUser.email
          ? {
              email: oauthUser.email.toLowerCase(),
              emailVerified: true, // considering oauth users have verified emails
              name: oauthUser.given_name,
              yandexMetricClientId,
              yandexMetricYclid,
              region,
            }
          : {
              tg_id: oauthUser.tg_id,
              yandexMetricClientId,
              yandexMetricYclid,
              name: oauthUser.given_name,
              region,
            },
        invitedBy,
        anonymousUser,
      )

      await Promise.all([
        provider === 'apple' &&
          user &&
          adapter.userRepository.update({
            where: { id: user.id },
            data: {
              authProviders: {
                create: {
                  provider: AuthProviderType.APPLE,
                  email: oauthUser.email,
                  external_id: oauthUser.external_id,
                },
              },
            },
          }),

        oauthUser.email &&
          adapter.mailGateway.sendWelcomeMail({
            to: oauthUser.email.toLowerCase(),
            user: {
              email: oauthUser.email.toLowerCase(),
              password: '',
            },
            locale: metadata?.locale,
          }),

        user &&
          adapter.actionRepository.create({
            data: {
              type: actions.REGISTRATION,
              user_id: user.id,
              platform: Platform.WEB,
            },
          }),
      ])
    } else {
      // Login user
      if (user.useEncryption) {
        throw new UnauthorizedError({
          code: 'LOGIN_WITH_PASSWORD',
          message: 'Please login with password',
        })
      }
    }

    if (!user) {
      throw new InternalError()
    }

    if (user.inactive) {
      await adapter.userRepository.update({
        where: { id: user.id },
        data: { inactive: false },
      })
    }

    const { accessToken, refreshToken } = await service.auth.signAuthTokens({
      user: user,
      keyEncryptionKey: null,
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
