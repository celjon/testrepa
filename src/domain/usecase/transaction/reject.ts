import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'
import { Role, TransactionStatus } from '@prisma/client'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Reject = (data: { userId: string; id: string }) => Promise<ITransaction | never>
export const buildReject = ({ adapter }: UseCaseParams): Reject => {
  return async ({ userId, id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const transaction = await adapter.transactionRepository.update({
      where: {
        id,
        deleted: false,
      },
      data: {
        status: TransactionStatus.FAILED,
      },
    })

    if (!transaction) {
      throw new NotFoundError()
    }

    return transaction
  }
}
