import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'
import { Role, TransactionStatus, TransactionType } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type ListWithdraw = (data: { userId: string }) => Promise<Array<ITransaction> | never>
export const buildListWithdraw = ({ adapter }: UseCaseParams): ListWithdraw => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const transactions = await adapter.transactionRepository.list({
      where: {
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
        deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return transactions
  }
}
