import { ISubscription } from '@/domain/entity/subscription'
import { Adapter } from '@/adapter'
import { Currency, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'
import { InvalidDataError } from '@/domain/errors'
import { uniqueUuid } from 'docx'
import { withTransaction } from '@/lib'

export type Replenish = (p: {
  subscription: ISubscription
  amount: number
  meta?: {
    from_user_id?: string
    source?: string
  }
  tx?: unknown
}) => Promise<ITransaction | never>

export const buildReplenish = ({
  transactor,
  subscriptionRepository,
  transactionRepository,
  employeeRepository,
}: Adapter): Replenish => {
  return async ({ subscription, amount, meta, tx }) => {
    if (amount < 0) {
      throw new InvalidDataError({
        code: 'NEGATIVE_AMOUNT',
      })
    }

    const id = uniqueUuid()

    return withTransaction(transactor, tx, async (tx) => {
      await subscriptionRepository.update(
        {
          where: {
            id: subscription.id,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        },
        tx,
      )

      if (!subscription.enterprise_id && subscription.user_id) {
        const employee = await employeeRepository.get({
          where: {
            user_id: subscription.user_id,
          },
        })

        if (employee) subscription.enterprise_id = employee.enterprise_id
      }

      const transaction = await transactionRepository.create(
        {
          data: {
            id,
            user_id: subscription.user_id ?? null,
            enterprise_id: subscription.enterprise_id ?? null,
            amount,
            type: TransactionType.REPLINSH,
            currency: Currency.BOTHUB_TOKEN,
            status: TransactionStatus.SUCCEDED,
            provider: TransactionProvider.BOTHUB,
            from_user_id: meta?.from_user_id,
            meta: meta?.source ? { source: meta.source } : undefined,
          },
        },
        tx,
      )

      await transactionRepository.chCreate({
        data: {
          id,
          amount,
          type: TransactionType.REPLINSH,
          user_id: subscription.user_id,
          platform: null,
          plan_id: subscription.plan_id,
          enterprise_id: subscription.enterprise_id,
          from_user_id: meta?.from_user_id ?? null,
          source: meta?.source ? meta.source : null,
        },
      })

      return transaction
    })
  }
}
