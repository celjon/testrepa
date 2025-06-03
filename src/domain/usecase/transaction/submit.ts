import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'
import { Role, TransactionStatus } from '@prisma/client'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Submit = (data: { userId: string; id: string }) => Promise<ITransaction | never>
export const buildSubmit = ({ adapter }: UseCaseParams): Submit => {
  return async ({ userId, id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const transaction = await adapter.transactionRepository.update({
      where: {
        id,
        deleted: false
      },
      data: {
        status: TransactionStatus.SUCCEDED
      }
    })

    if (!transaction) {
      throw new NotFoundError()
    }

    if (transaction.referral_id) {
      await adapter.referralRepository.update({
        where: {
          id: transaction.referral_id
        },
        data: {
          balance: {
            decrement: transaction.amount
          }
        }
      })
    }

    return transaction
  }
}
