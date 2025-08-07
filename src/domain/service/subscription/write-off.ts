import { uniqueUuid } from 'docx'
import {
  Currency,
  EnterprisePaymentPlanStatus,
  EnterpriseRole,
  Platform,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '@prisma/client'
import { withTransaction } from '@/lib'
import { ISubscription } from '@/domain/entity/subscription'
import { Adapter } from '@/adapter'
import { ITransaction } from '@/domain/entity/transaction'
import { logger } from '@/lib/logger'
import { actions, determinePlatform } from '@/domain/entity/action'
import { IEmployee } from '@/domain/entity/employee'
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
  | 'modelRepository'
> & {
  accrueReferralCapsEncouragement: AccrueReferralCapsEncouragement
}

export type WriteOff = (p: {
  subscription: ISubscription
  amount: number
  meta: {
    userId: string // id of admin or user that made request
    enterpriseId?: string
    platform?: Platform
    model_id?: string
    provider_id?: string
    g4f_account_id?: string
    from_user_id?: string
    developerKeyId?: string
    expense_details?: {
      web_search: number
    }
  }
  tx?: unknown
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
  modelRepository,
  accrueReferralCapsEncouragement,
}: Params): WriteOff => {
  return async ({ subscription, amount, meta, tx }) => {
    if (amount < 0) {
      throw new InvalidDataError({
        code: 'NEGATIVE_AMOUNT',
      })
    }

    const model = meta.model_id ? await modelRepository.get({ where: { id: meta.model_id } }) : null

    let employee: IEmployee | null = null
    if (!subscription.enterprise_id && subscription.user_id) {
      employee = await employeeRepository.get({
        where: { user_id: subscription.user_id },
      })
    }

    if (subscription.enterprise_id && !subscription.user_id) {
      employee = await employeeRepository.get({
        where: {
          user_id: meta.userId,
          enterprise_id: subscription.enterprise_id,
        },
      })
    }

    return withTransaction(
      transactor,
      tx,
      async (tx) => {
        subscription = await subscriptionRepository.update(
          {
            where: { id: subscription.id },
            data: {
              balance: { decrement: BigInt(Math.trunc(amount)) },
            },
            include: {
              plan: true,
              enterprise: true,
            },
          },
          tx,
        )

        const balanceBefore = Number(subscription.balance) + Math.trunc(amount)

        if (!subscription.enterprise_id && subscription.user_id) {
          subscription.enterprise_id = employee?.enterprise_id ?? null
        }

        if (subscription.enterprise_id && !subscription.user_id) {
          if (employee) {
            subscription.user_id = employee.user_id
            await employeeRepository.update(
              {
                where: { user_id: employee.user_id },
                data: {
                  spent_in_month: { increment: BigInt(Math.trunc(amount)) },
                },
              },
              tx,
            )
          }
        }

        let accrueEncouragementPromise: Promise<void> | undefined
        if (subscription.user_id) {
          accrueEncouragementPromise = accrueReferralCapsEncouragement(
            {
              participantSubscription: subscription,
              spent_caps: amount,
            },
            tx,
          )
        }

        const transaction_id = uniqueUuid()
        const action_id = uniqueUuid()

        let creditAmount: number | null = null
        let source: string = EnterprisePaymentPlanStatus.DEBIT

        if (
          subscription.payment_plan === EnterprisePaymentPlanStatus.CREDIT &&
          subscription.credit_limit &&
          balanceBefore <= 0
        ) {
          source = EnterprisePaymentPlanStatus.CREDIT
          creditAmount = amount
        } else if (balanceBefore > 0 && balanceBefore < amount) {
          source = 'DEBIT_CREDIT_MIX'
          creditAmount = amount - balanceBefore
        }

        const [_, newTransaction] = await Promise.all([
          accrueEncouragementPromise,
          transactionRepository.create(
            {
              data: {
                id: transaction_id,
                user_id: subscription.user_id,
                enterprise_id: meta.enterpriseId ?? subscription.enterprise_id,
                amount: amount,
                type: TransactionType.WRITE_OFF,
                currency: Currency.BOTHUB_TOKEN,
                status: TransactionStatus.SUCCEDED,
                provider: TransactionProvider.BOTHUB,
                from_user_id: meta.from_user_id,
                ...(meta.expense_details && {
                  meta: {
                    expense_details: {
                      ...meta.expense_details,
                      ...(creditAmount != null && { credit_spent: creditAmount }),
                    },
                    source,
                  },
                }),
                developer_key_id: meta.developerKeyId ?? null,
              },
            },
            tx,
          ),
        ])
        await actionRepository.create(
          {
            data: {
              id: action_id,
              type: actions.TOKEN_WRITEOFF,
              user_id: meta.userId,
              enterprise_id: meta.enterpriseId ?? subscription.enterprise_id,
              platform: determinePlatform(meta.platform, !!meta.enterpriseId),
              transaction_id: newTransaction.id,
              model_id: meta.model_id,
              provider_id: meta.provider_id,
              meta: meta.g4f_account_id
                ? {
                    g4f_account_id: meta.g4f_account_id,
                  }
                : undefined,
            },
          },
          tx,
        )

        await transactionRepository.chCreate({
          data: {
            id: transaction_id,
            amount: amount,
            type: TransactionType.WRITE_OFF,
            user_id: subscription.user_id,
            platform: determinePlatform(meta.platform, !!meta.enterpriseId),
            plan_type: subscription.plan?.type ?? null,
            model_id: meta.model_id ?? null,
            provider_id: meta.provider_id ?? null,
            plan_id: subscription.plan_id,
            model_features: model?.features,
            developer_key_id: meta.developerKeyId ?? null,
            enterprise_id: meta.enterpriseId ?? subscription.enterprise_id,
            g4f_account_id: meta.g4f_account_id ?? null,
            from_user_id: meta.from_user_id ?? null,
            referral_id: null,
            web_search: meta.expense_details?.web_search,
            action_id: action_id,
            source,
            credit_spent: creditAmount,
          },
        })
        return { transaction: newTransaction, subscription }
      },
      {
        timeout: 8_000, // ms
      },
    )
  }
}

//
type ParamsWithLimitNotification = Pick<
  Adapter,
  'employeeRepository' | 'userRepository' | 'queueManager'
> & {
  writeOff: WriteOff
}

export const buildWriteOffWithLimitNotification = ({
  employeeRepository,
  userRepository,
  queueManager,
  writeOff,
}: ParamsWithLimitNotification): WriteOff => {
  return async ({ subscription, amount, meta }) => {
    const data = await writeOff({
      subscription,
      amount,
      meta,
    })

    try {
      let email: string

      if (subscription.enterprise_id) {
        const owner = await employeeRepository.get({
          where: {
            enterprise_id: subscription.enterprise_id,
            role: EnterpriseRole.OWNER,
          },
          include: { user: true },
        })
        email = owner?.user?.email ?? ''
      } else {
        const user = await userRepository.get({
          where: { id: subscription.user_id ?? '' },
        })
        email = user?.email ?? ''
      }

      if (
        subscription.soft_limit &&
        subscription.balance - BigInt(Math.trunc(amount)) <= BigInt(subscription.soft_limit)
      ) {
        queueManager.publishSoftLimitNotification({
          to: email,
          subscriptionId: subscription.id,
        })
      }
    } catch (e) {
      logger.log({
        level: 'error',
        location: 'writeOffWithLimitNotification',
        message: `Failed to notify soft limit due to ${(e as Error).message}`,
      })
    }

    return data
  }
}
