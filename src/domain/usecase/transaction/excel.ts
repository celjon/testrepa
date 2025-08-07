import { UseCaseParams } from '@/domain/usecase/types'
import { Role, TransactionStatus, TransactionType } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type Excel = (data: { userId?: string }) => Promise<Buffer>

export const buildExcel = ({ adapter, service }: UseCaseParams): Excel => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const file = await service.transaction.toExcel({
      type: TransactionType.SUBSCRIPTION,
      status: TransactionStatus.SUCCEDED,
    })

    return file
  }
}
