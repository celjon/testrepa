import { ISubscription } from '@/domain/entity/subscription'
import { Adapter } from '../../types'
import { Currency, EnterpriseRole, Platform, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'
import { logger } from '@/lib/logger'
import { actions, determinePlatform } from '@/domain/entity/action'
import { AccrueReferralCapsEncouragement } from './accrue-referral-caps-encouragement'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<
  Adapter,
  | 'transactor'
  | 'subscriptionRepository'
  | 'employeeRepository'
  | 'transactionRepository'
  | 'actionRepository'
  | 'referralParticipantRepository'
  | 'referralRepository'
> & {
  accrueReferralCapsEncouragement: AccrueReferralCapsEncouragement
}

export type WriteOff = (p: {
  subscription: ISubscription
  amount: number
  meta?: {
    messageId?: string
    userId?: string
    enterpriseId?: string
    platform?: Platform
    model_id?: string
    from_user_id?: string
    expense_details?: {
      web_search: number
    }
  }
}) => Promise<
  | {
      transaction: ITransaction
      subscription: ISubscription
    }
  | never
>

export const buildWriteOff = ({
  transactor,
  subscriptionRepository,
  transactionRepository,
  employeeRepository,
  actionRepository,
  accrueReferralCapsEncouragement
}: Params): WriteOff => {
  return async ({ subscription, amount, meta }) => {
    if (amount < 0) {
      throw new InvalidDataError({
        code: 'NEGATIVE_AMOUNT'
      })
    }

    const transaction = await transactor.inTx(
      async (tx) => {
        subscription =
          (await subscriptionRepository.update(
            {
              where: {
                id: subscription.id
              },
              data: {
                balance: {
                  decrement: BigInt(Math.trunc(amount))
                }
              },
              include: {
                plan: true,
                enterprise: true
              }
            },
            tx
          )) ?? subscription

        if (!subscription.enterprise_id && subscription.user_id) {
          const employee = await employeeRepository.get({
            where: {
              user_id: subscription.user_id
            }
          })

          if (employee) subscription.enterprise_id = employee.enterprise_id
        }

        if (subscription.enterprise && subscription.enterprise.common_pool && !subscription.user_id) {
          const employee = await employeeRepository.get({
            where: {
              user_id: meta?.userId,
              enterprise_id: subscription?.enterprise_id as string
            }
          })

          if (employee) subscription.user_id = employee.user_id
        }

        let accrueEncouragementPromise: Promise<void> | undefined
        if (subscription.user_id) {
          accrueEncouragementPromise = accrueReferralCapsEncouragement(
            {
              participantSubscription: subscription,
              spent_caps: amount
            },
            tx
          )
        }

        const [_, newTransaction] = await Promise.all([
          accrueEncouragementPromise,
          transactionRepository.create(
            {
              data: {
                user_id: subscription.user_id,
                enterprise_id: meta?.enterpriseId ? meta.enterpriseId : subscription.enterprise_id,
                amount: amount,
                type: TransactionType.WRITE_OFF,
                currency: Currency.BOTHUB_TOKEN,
                status: TransactionStatus.SUCCEDED,
                provider: TransactionProvider.BOTHUB,
                from_user_id: meta?.from_user_id,
                ...(meta?.messageId && {
                  message: {
                    connect: {
                      id: meta.messageId
                    }
                  }
                }),
                ...(meta?.expense_details && {
                  meta: {
                    expense_details: meta.expense_details
                  }
                })
              }
            },
            tx
          )
        ])

        await actionRepository.create(
          {
            data: {
              type: actions.TOKEN_WRITEOFF,
              user_id: meta?.userId,
              enterprise_id: meta?.enterpriseId ? meta.enterpriseId : subscription.enterprise_id,
              platform: determinePlatform(meta?.platform, !!meta?.enterpriseId),
              transaction_id: newTransaction.id,
              model_id: meta?.model_id
            }
          },
          tx
        )

        return newTransaction
      },
      {
        timeout: 8_000 // ms
      }
    )

    return { transaction, subscription }
  }
}

type ParamsWithLimitNotification = Pick<Adapter, 'employeeRepository' | 'userRepository' | 'queueManager'> & {
  writeOff: WriteOff
}

export const buildWriteOffWithLimitNotification = ({
  employeeRepository,
  userRepository,
  queueManager,
  writeOff
}: ParamsWithLimitNotification): WriteOff => {
  return async ({ subscription, amount, meta }) => {
    const data = await writeOff({
      subscription,
      amount,
      meta
    })

    try {
      let email: string

      if (subscription.enterprise_id) {
        const owner = await employeeRepository.get({
          where: {
            enterprise_id: subscription.enterprise_id,
            role: EnterpriseRole.OWNER
          },
          include: {
            user: true
          }
        })
        email = owner?.user?.email as string
      } else {
        const user = await userRepository.get({
          where: {
            id: subscription.user_id as string
          }
        })
        email = user?.email as string
      }

      if (subscription.soft_limit && subscription.balance - BigInt(Math.trunc(amount)) <= BigInt(subscription.soft_limit)) {
        queueManager.publishSoftLimitNotification({
          to: email,
          subscriptionId: subscription.id
        })
      }
    } catch (e) {
      logger.log({
        level: 'error',
        message: `Failed to notify soft limit due to ${(e as Error).message}`
      })
    }

    return data
  }
}
