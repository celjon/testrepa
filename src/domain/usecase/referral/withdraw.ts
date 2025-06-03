import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'
import { TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { ForbiddenError, InternalError } from '@/domain/errors'

export type Withdraw = (data: { userId: string; id: string; details: string }) => Promise<ITransaction | never>

export const buildWithdraw = ({ adapter }: UseCaseParams): Withdraw => {
  return async ({ userId, id, details }) => {
    const referral = await adapter.referralRepository.get({
      where: {
        owner_id: userId,
        id,
        disabled: false
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        template: {
          include: {
            plan: true
          }
        },
        transactions: {
          where: {
            status: TransactionStatus.PENDING,
            type: TransactionType.WITHDRAW
          }
        }
      }
    })

    if (!referral || !referral.transactions || referral.transactions.length > 0 || !referral.template) {
      throw new ForbiddenError()
    }

    const transaction = (await adapter.transactionRepository.create({
      data: {
        referral_id: referral.id,
        status: TransactionStatus.PENDING,
        meta: details,
        provider: TransactionProvider.BOTHUB,
        currency: referral.template.currency,
        amount: referral.balance,
        type: TransactionType.WITHDRAW
      }
    })) as ITransaction

    if (!transaction) {
      throw new InternalError()
    }

    return transaction
  }
}
