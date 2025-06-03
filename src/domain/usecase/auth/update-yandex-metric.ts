import { IUser } from '@/domain/entity/user'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type UpdateYandexMetric = (data: {
  userId: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
}) => Promise<IUser | never>

export const buildUpdateYandexMetric = ({ adapter }: UseCaseParams): UpdateYandexMetric => {
  return async ({ userId, yandexMetricClientId, yandexMetricYclid }) => {
    const user = await adapter.userRepository.update({
      where: { id: userId },
      data: { yandexMetricClientId, yandexMetricYclid }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    return user
  }
}
