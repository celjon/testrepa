import { IUser } from '@/domain/entity/user'
import { InternalError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Fingerprint = (data: {
  fingerprint: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
}) => Promise<
  | {
      user: IUser
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildFingerprint = ({ service, adapter }: UseCaseParams): Fingerprint => {
  return async ({ fingerprint, yandexMetricClientId, yandexMetricYclid }) => {
    let user = await adapter.userRepository.get({
      where: {
        anonymousDeviceFingerprint: fingerprint,
      },
    })

    if (!user) {
      user = await service.user.initialize({
        anonymousDeviceFingerprint: fingerprint,
        emailVerified: false,
        yandexMetricClientId,
        yandexMetricYclid,
      })

      const planModels = await adapter.planModelRepository.list({
        where: {
          plan_id: user?.subscription?.plan?.id,
        },
        include: {
          model: {
            include: {
              parent: true,
            },
          },
        },
      })

      user!.subscription!.plan!.models = planModels
    }

    if (!user) {
      throw new InternalError()
    }

    const { refreshToken, accessToken } = await service.auth.signAuthTokens({
      user,
      keyEncryptionKey: null,
    })

    return {
      user,
      refreshToken,
      accessToken,
    }
  }
}
