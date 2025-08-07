import { UseCaseParams } from '@/domain/usecase/types'
import {
  Currency,
  PlanType,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '@prisma/client'
import { logger } from '@/lib/logger'
import { isAxiosError } from 'axios'
import { config } from '@/config'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
// @ts-ignore
import yametrika from 'yametrika'
import { actions } from '@/domain/entity/action'

const counter = yametrika.counter({ id: config.metrics.yandex.counter })

export type Payment = (data: {
  paymentId: string
  provider: TransactionProvider
  status: TransactionStatus
  meta: any
  locale?: string
}) => Promise<void>

export const buildPayment = ({ adapter }: UseCaseParams): Payment => {
  return async ({ paymentId, provider, status, meta, locale }) => {
    if (!paymentId) {
      throw new InvalidDataError()
    }
    const transaction = await adapter.transactionRepository.get({
      where: {
        external_id: paymentId,
        provider: provider,
        deleted: false,
      },
      include: {
        plan: true,
        user: {
          include: {
            referral_participants: {
              include: {
                referral: {
                  include: {
                    template: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!transaction) {
      throw new NotFoundError({
        code: 'TRANSACTION_NOT_FOUND',
      })
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ForbiddenError({
        code: 'TRANSACTION_IS_NOT_IN_PENDING_STATE',
      })
    }
    await adapter.transactionRepository.update({
      where: {
        id: transaction.id,
        deleted: false,
      },
      data: {
        status: status,
        meta: meta,
      },
    })
    if (status === TransactionStatus.SUCCEDED) {
      if (config?.metrics?.yandex?.counter) {
        try {
          if (transaction.plan?.type === PlanType.BASIC) {
            counter.hit()
            counter.reachGoal('basic_plan')
          }

          if (transaction.plan?.type === PlanType.PREMIUM) {
            counter.hit()
            counter.reachGoal('premium_plan')
          }

          if (transaction.plan?.type === PlanType.DELUXE) {
            counter.hit()
            counter.reachGoal('deluxe_plan')
          }

          if (transaction.plan?.type === PlanType.ELITE) {
            counter.hit()
            counter.reachGoal('elite_plan')
          }
          counter.hit()
          counter.reachGoal('paid_plan')
          if (transaction?.user?.id) {
            if (
              transaction.user.yandexMetricClientId !== null ||
              transaction.user.yandexMetricYclid !== null
            ) {
              try {
                await adapter.yandexMetricGateway.sendOfflineConversion({
                  yandexMetricClientId: transaction.user.yandexMetricClientId,
                  userId: transaction?.user?.id,
                  yandexMetricYclid: transaction.user.yandexMetricYclid,
                  purchaseId: transaction.id,
                  goal: 'paid_plan',
                  price: transaction.plan?.price || 0,
                  currency: transaction.currency,
                })
              } catch (error) {
                logger.log({
                  level: 'error',
                  message: `Error on send paid plan offline conversion:: ${JSON.stringify(error.response?.data)}`,
                })
              }
            }
          }
        } catch (error) {
          if (isAxiosError(error)) {
            logger.log({
              level: 'error',
              message: `payment: ${JSON.stringify(error.response?.data)}`,
            })
          }
        }
      }
      if (transaction.type === TransactionType.SUBSCRIPTION && transaction.plan) {
        const subscription = await adapter.subscriptionRepository.get({
          where: {
            user_id: transaction.user_id!,
          },
          include: {
            plan: true,
            user: true,
          },
        })
        if (!subscription?.plan) {
          throw new NotFoundError({
            code: 'SUBSCRIPTION_NOT_FOUND',
          })
        }

        await adapter.subscriptionRepository.update({
          where: {
            user_id: transaction.user_id!,
          },
          data: {
            plan_id:
              subscription.plan.tokens > transaction.plan.tokens
                ? subscription.plan_id
                : transaction.plan_id,
            balance: { increment: transaction.plan.tokens },
            created_at: new Date(),
          },
        })

        const referral = transaction.user?.referral_participants?.[0]?.referral

        if (referral && referral.template) {
          const alterPlan = await adapter.planRepository.get({
            where: {
              type: transaction.plan.type,
              currency: referral.template.currency,
            },
          })

          if (alterPlan) {
            await adapter.referralRepository.update({
              where: {
                id: referral.id,
              },
              data: {
                balance: {
                  increment: alterPlan.price * (referral.template.encouragement_percentage / 100),
                },
              },
            })
          }
        }

        await adapter.transactionRepository.create({
          data: {
            type: TransactionType.REPLINSH,
            status: TransactionStatus.SUCCEDED,
            currency: Currency.BOTHUB_TOKEN,
            user_id: transaction.user_id,
            amount: transaction.plan.tokens,
            provider: TransactionProvider.BOTHUB,
          },
        })

        await adapter.actionRepository.create({
          data: {
            type: actions.SUBSCRIPTION_PURCHASE,
            transaction_id: transaction.id,
            user_id: transaction.user_id,
          },
        })

        if (transaction.from_user_id && transaction.user_id) {
          const tokens = transaction.plan.tokens
          if (subscription.user?.email) {
            await adapter.mailGateway.sendGiftTokenMail({
              to: subscription.user.email,
              tokens,
              locale,
            })

            await adapter.telegramGateway.notifyAboutPresent({
              type: 'present',
              userId: transaction.user_id,
              fromUserId: transaction.from_user_id,
              tokens: tokens,
              viaEmail: true,
            })
          } else {
            await adapter.telegramGateway.notifyAboutPresent({
              type: 'present',
              userId: transaction.user_id,
              fromUserId: transaction.from_user_id,
              tokens: tokens,
              viaEmail: false,
            })
          }
        }
      }
    }
  }
}
