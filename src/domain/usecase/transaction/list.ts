import { UseCaseParams } from '@/domain/usecase/types'
import { ITransaction } from '@/domain/entity/transaction'

export type List = (p: { userId: string; page?: number }) => Promise<
  | {
      data: Array<ITransaction>
      pages: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ userId, page }) => {
    const transactions = await service.transaction.paginate({
      query: {
        where: {
          user_id: userId,
          deleted: false
        },
        orderBy: {
          created_at: 'desc'
        }
      },
      page
    })

    return transactions
  }
}
