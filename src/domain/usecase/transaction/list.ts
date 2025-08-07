import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'

export type List = (p: { userId: string; page?: number; withDeveloperKey: boolean }) => Promise<
  | {
      data: Array<ITransaction>
      pages: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ userId, page, withDeveloperKey }) => {
    const transactions = await service.transaction.paginate({
      query: {
        where: {
          user_id: userId,
          deleted: false,
          ...(withDeveloperKey && {
            developer_key_id: {
              not: null,
            },
          }),
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
    })
    //clickhouse method temp off

    /*const chTransactions = await service.transaction.chPaginate({
      query: {
        where: {
          user_id: userId,
          ...(withDeveloperKey && {
            developer_key_id: {
              not: null,
            },
          }),
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      page,
      quantity: 20,
    })*/

    return {
      /*data: chTransactions.data,
      pages: chTransactions.pages,*/
      data: transactions.data.map((tx) => ({
        ...tx,
        action: tx.actions?.length ? tx.actions[0] : null,
      })),
      pages: transactions.pages,
    }
  }
}
