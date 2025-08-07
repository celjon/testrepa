import { PlanType } from '@prisma/client'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { NotFoundError } from '@/domain/errors'
import { planOrder } from '@/domain/entity/plan'
import { UseCaseParams } from '../types'

export type Activate = (params: {
  userId: string
  code: string
}) => Promise<{ amount: number; plan: PlanType }>

export const buildActivate = ({ adapter, service }: UseCaseParams): Activate => {
  return async ({ userId, code }) => {
    const giftCertificate = await adapter.giftCertificateRepository.get({
      where: { code },
    })

    if (!giftCertificate) {
      throw new NotFoundError({
        code: 'GIFT_CERTIFICATE_NOT_FOUND',
      })
    }

    const user = await adapter.userRepository.get({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    })
    if (!user?.subscription) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    }

    const plan = await adapter.planRepository.get({ where: { type: giftCertificate.plan } })

    if (!plan) {
      throw new NotFoundError({ code: 'PLAN_NOT_FOUND' })
    }

    await adapter.transactor.inTx(
      async (tx) => {
        try {
          const jobs = [
            await service.subscription.replenish({
              subscription: user.subscription!,
              amount: Number(giftCertificate.amount),
              meta: { from_user_id: giftCertificate.from_user_id, source: 'giftCertificate' },
              tx,
            }),
            await adapter.subscriptionRepository.update(
              {
                where: { id: user.subscription!.id! },
                data: {
                  plan_id:
                    planOrder.indexOf(user.subscription!.plan!.type) > planOrder.indexOf(plan.type)
                      ? user.subscription?.plan_id
                      : plan.id,
                },
              },
              tx,
            ),
            await adapter.giftCertificateRepository.delete({ where: { code } }, tx),
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

    return { amount: Number(giftCertificate!.amount), plan: giftCertificate.plan }
  }
}
