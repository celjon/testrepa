import { Adapter, TransactionRepository } from '@/domain/types'
import { Transaction } from '@prisma/client'

export type ChPaginate = (args: {
  query: Parameters<TransactionRepository['list']>[0]
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<Transaction>
      pages: number
    }
  | never
>

export const buildChPaginate = ({ transactionRepository }: Adapter): ChPaginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page !== 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const skip = page ? (page - 1) * quantity : undefined
    const take = page ? quantity : undefined

    const clickhouseArgs = {
      where: extractClickhouseWhere(query?.where),
      orderByCreatedAt: extractOrder(query?.orderBy),
      skip,
      take,
    }
    const data = await transactionRepository.chList(clickhouseArgs)
    const total = await transactionRepository.chCount(clickhouseArgs)
    const pages = page ? Math.ceil(total / quantity) : 1

    return {
      data,
      pages,
    }
  }
}

function extractClickhouseWhere(where: any): {
  user_id?: string
  developer_key_id_not_null?: boolean
} {
  const out: any = {}
  if (where?.user_id) out.user_id = where.user_id
  if (where?.developer_key_id?.not === null) out.developer_key_id_not_null = true
  return out
}

function extractOrder(orderBy: any): 'asc' | 'desc' | undefined {
  if (orderBy?.created_at === 'asc' || orderBy?.created_at === 'desc') {
    return orderBy.created_at
  }
  return undefined
}
