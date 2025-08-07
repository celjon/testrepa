import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { Region } from '@prisma/client'

enum PaymentMethod {
  TINKOFF = 'TINKOFF',
  KASPI = 'KASPI',
  STRIPE = 'STRIPE',
  CRYPTO = 'CRYPTO',
}

const paymentMethodsMap = {
  [Region.RU]: [PaymentMethod.TINKOFF],
  [Region.KZ]: [PaymentMethod.KASPI, PaymentMethod.STRIPE],
  [Region.GLOBAL]: [PaymentMethod.STRIPE, PaymentMethod.CRYPTO],
}

export type GetPaymentMethods = (data: { userId: string; ip: string }) => Promise<
  | {
      region: Region
      paymentMethods: PaymentMethod[]
    }
  | never
>

export const buildGetPaymentMethods = ({ adapter, service }: UseCaseParams): GetPaymentMethods => {
  return async ({ userId, ip }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    let paymentRegion = user.region

    if (!paymentRegion) {
      paymentRegion = await service.geo.determinePaymentRegion({ ip })

      await adapter.userRepository.update({
        where: { id: userId },
        data: { region: paymentRegion },
      })
    }

    if (paymentMethodsMap[paymentRegion]) {
      return {
        region: paymentRegion,
        paymentMethods: paymentMethodsMap[paymentRegion],
      }
    }

    throw new InvalidDataError({
      code: 'UNKNOWN_REGION',
    })
  }
}
