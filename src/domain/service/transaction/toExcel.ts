import { Adapter } from '../../types'
import { TransactionStatus, TransactionType } from '@prisma/client'

export type ToExcel = (p: {
  type?: TransactionType
  status?: TransactionStatus
}) => Promise<Buffer | never>

export const buildToExcel = ({ transactionRepository }: Adapter): ToExcel => {
  return async ({ type, status }) => {
    const transactions = await transactionRepository.list({
      where: {
        user_id: {
          not: null,
        },
        type: type,
        status: status,
        deleted: false,
      },
      include: {
        user: true,
        plan: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    const buf = await transactionRepository.toExcel(transactions)
    return buf
  }
}
