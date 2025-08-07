import { PlanType } from '@prisma/client'
import { getErrorString, getRandomString } from '@/lib'
import { logger } from '@/lib/logger'
import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { planOrder } from '@/domain/entity/plan'
import { UseCaseParams } from '../types'

export type Create = (params: {
  userId: string
  amount: number
  locale: string
  message?: string
  recipient_name?: string
}) => Promise<{ amount: number }>

export const buildCreate = ({ adapter, service }: UseCaseParams): Create => {
  return async ({ userId, locale, amount, message, recipient_name }) => {
    const code = getRandomString(16, true)

    const user = await adapter.userRepository.get({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    })
    if (!user?.subscription) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    }
    if (!user?.email) {
      throw new NotFoundError({
        code: 'EMAIL_NOT_FOUND',
      })
    }
    if ((message && message.length > 4096) || (recipient_name && recipient_name?.length > 255)) {
      throw new InvalidDataError({
        code: 'INVALID_LENGTH_MESSAGE_OR_RECIPIENT_NAME',
      })
    }
    if (
      amount < 999999 ||
      user.subscription.balance < amount ||
      user.subscription?.plan?.type === PlanType.FREE
    ) {
      throw new InvalidDataError({
        code: 'INSUFFICIENT_BALANCE_OR_PLAN_TYPE',
      })
    }
    const plan: PlanType =
      planOrder.indexOf(user.subscription!.plan!.type) <= 0
        ? PlanType.FREE
        : planOrder[planOrder.indexOf(user.subscription!.plan!.type) - 1]

    await adapter.transactor.inTx(
      async (tx) => {
        try {
          const jobs = [
            await service.subscription.writeOff({
              subscription: user.subscription!,
              amount,
              meta: { userId },
              tx,
            }),
            await adapter.giftCertificateRepository.create(
              {
                data: {
                  code,
                  from_user_id: userId,
                  amount: BigInt(amount),
                  plan,
                  message: message ?? null,
                  recipient_name: recipient_name ?? null,
                },
              },
              tx,
            ),
          ]

          await Promise.all(jobs)

          return
        } catch (e) {
          logger.error({
            location: 'useCase.giftCertificate.create',
            message: getErrorString(e),
          })

          throw e
        }
      },
      {
        timeout: 10000,
      },
    )
    const certificate = await adapter.giftCertificateRepository.get({
      where: { code },
    })

    if (!certificate) {
      throw new NotFoundError({
        code: 'GIFT_CERTIFICATE_NOT_FOUND',
      })
    }

    await adapter.mailGateway.sendGiftCertificateMail({
      to: user.email,
      message,
      recipient_name,
      code: certificate.code,
      amount,
      locale,
    })
    return { amount: Number(certificate.amount) }
  }
}
