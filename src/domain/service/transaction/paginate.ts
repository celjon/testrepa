import { Adapter, TransactionRepository } from '@/domain/types'
import { ITransaction } from '@/domain/entity/transaction'

export type Paginate = (data: { query: Parameters<TransactionRepository['list']>[0]; page?: number; quantity?: number }) => Promise<
  | {
      data: Array<ITransaction>
      pages: number
    }
  | never
>

export const buildPaginate = ({ transactionRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0
      }
    }

    const data = await transactionRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity })
    })

    const pages = page
      ? Math.ceil(
          (await transactionRepository.count({
            where: { ...query?.where, deleted: false }
          })) / quantity
        )
      : 1

    return {
      data,
      pages
    }
  }
}
