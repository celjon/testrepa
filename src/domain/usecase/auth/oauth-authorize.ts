import { Platform } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { InternalError, InvalidDataError, UnauthorizedError } from '@/domain/errors'
import { actions } from '@/domain/entity/action'

export type OAuthAuthorize = (params: {
  provider: string
  code: string
  device_id: string
  code_verifier?: string
  redirect_uri: string
  invitedBy?: string
  fingerprint?: string
  ip: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
  metadata?: {
    locale?: string
  }
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
    yandexMetricClientId,
    yandexMetricYclid
  }) => {
    const oauthUser = await adapter.authRepository.verifyOAuth({
      provider,
      code,
      device_id,
      code_verifier,
      redirect_uri,
      yandexMetricClientId,
      yandexMetricYclid
    })

    if (!oauthUser) {
      throw new InvalidDataError({
        code: 'TOKEN_INVALID'
      })
    }

    if (!oauthUser.email && !oauthUser.tg_id) {
      throw new UnauthorizedError()
    }

    let user = await adapter.userRepository.get({
      where: {
        email: oauthUser.email?.toLowerCase(),
        tg_id: oauthUser.tg_id
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        employees: {
          include: {
            enterprise: {
              include: {
                subscription: {
                  include: {
                    plan: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const region = await service.geo.determinePaymentRegion({ ip })

    // Register user
    if (!user) {
      let anonymousUser: IUser | null

      if (fingerprint) {
        anonymousUser = await adapter.userRepository.get({
          where: {
            anonymousDeviceFingerprint: fingerprint
          },
          include: {
            subscription: true
          }
        })
      } else {
        anonymousUser = null
      }

      user = await service.user.initialize(
        oauthUser.email
          ? {
              email: oauthUser.email.toLowerCase(),
              emailVerified: true, // considering oauth users have verified emails
              name: oauthUser.given_name,
              yandexMetricClientId,
              yandexMetricYclid,
              region
            }
          : { tg_id: oauthUser.tg_id, yandexMetricClientId, yandexMetricYclid, name: oauthUser.given_name, region },
        invitedBy,
        anonymousUser
      )

      await Promise.all([
        oauthUser.email &&
          adapter.mailGateway.sendWelcomeMail({
            to: oauthUser.email.toLowerCase(),
            user: {
              email: oauthUser.email.toLowerCase(),
              password: ''
            },
            locale: metadata?.locale
          }),

        adapter.actionRepository.create({
          data: {
            type: actions.REGISTRATION,
            user_id: (user as IUser).id,
            platform: Platform.WEB
          }
        })
      ])
    } else {
      // Login user
      if (user.useEncryption) {
        throw new UnauthorizedError({
          code: 'LOGIN_WITH_PASSWORD',
          message: 'Please login with password'
        })
      }
    }

    if (!user) {
      throw new InternalError()
    }

    if (user.inactive) {
      await adapter.userRepository.update({
        where: { id: user.id },
        data: { inactive: false }
      })
    }

    const { accessToken, refreshToken } = await service.auth.signAuthTokens({
      user: user,
      keyEncryptionKey: null
    })

    user.encryptedDEK = null
    user.kekSalt = null
    user.password = null

    return {
      user,
      accessToken,
      refreshToken
    }
  }
}
