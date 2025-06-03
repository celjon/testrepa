import { ISubscription } from '@/domain/entity/subscription'
import { Adapter } from '../../types'
import { Currency, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'
import { InvalidDataError } from '@/domain/errors'

export type Replenish = (p: {
  subscription: ISubscription
  amount: number
  meta?: {
    from_user_id?: string
    source?: string
  }
}) => Promise<ITransaction | never>

export const buildReplenish = ({ transactor, subscriptionRepository, transactionRepository, employeeRepository }: Adapter): Replenish => {
  return async ({ subscription, amount, meta }) => {
    if (amount < 0) {
      throw new InvalidDataError({
        code: 'NEGATIVE_AMOUNT'
      })
    }

    const transaction = await transactor.inTx(async (tx) => {
      await subscriptionRepository.update(
        {
          where: {
            id: subscription.id
          },
          data: {
            balance: {
              increment: amount
            }
          }
        },
        tx
      )

      if (!subscription.enterprise_id && subscription.user_id) {
        const employee = await employeeRepository.get({
          where: {
            user_id: subscription.user_id
          }
        })

        if (employee) subscription.enterprise_id = employee.enterprise_id
      }

      const transaction = await transactionRepository.create(
        {
          data: {
            user_id: subscription.user_id,
            enterprise_id: subscription.enterprise_id,
            amount: amount,
            type: TransactionType.REPLINSH,
            currency: Currency.BOTHUB_TOKEN,
            status: TransactionStatus.SUCCEDED,
            provider: TransactionProvider.BOTHUB,
            from_user_id: meta?.from_user_id,
            meta: meta?.source ? { source: meta.source } : undefined
          }
        },
        tx
      )

      return transaction
    })

    return transaction
  }
}
