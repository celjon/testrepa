import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'
import { Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type ListById = (p: { userId: string; id: string; page?: number }) => Promise<
  | {
      data: Array<ITransaction>
      pages: number
    }
  | never
>

export const buildListById = ({ adapter, service }: UseCaseParams): ListById => {
  return async ({ userId, page, id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    // TODO: permission service

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const transactions = await service.transaction.paginate({
      query: {
        where: {
          user_id: id,
          deleted: false
        },
        orderBy: {
          created_at: 'desc'
        }
      },
      page,
      quantity: 30
    })

    return transactions
  }
}
