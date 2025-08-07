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
        id: userId,
      },
    })

    // TODO: permission service

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const transactions = await service.transaction.paginate({
      query: {
        where: {
          user_id: id,
          deleted: false,
        },
        include: {
          actions: {
            select: {
              id: true,
              model_id: true,
              platform: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      page,
      quantity: 30,
    })
    return {
      data: transactions.data.map((tx) => ({
        ...tx,
        action: tx.actions?.length ? tx.actions[0] : null,
      })),
      pages: transactions.pages,
    }
    //MIGRATION_ON_CLICKHOUSE temp off
    /*const chTransactions = await service.transaction.chPaginate({
      query: {
        where: {
          user_id: id,
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      page,
      quantity: 30,
    })

    return {
      data: chTransactions.data,
      pages: chTransactions.pages,
    }*/
  }
}
