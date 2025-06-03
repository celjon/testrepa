import { Adapter, PlanRepository } from '@/domain/types'
import { IPlan } from '@/domain/entity/plan'

export type Paginate = (data: { query: Parameters<PlanRepository['list']>[0]; page?: number; quantity?: number }) => Promise<
  | {
      data: Array<IPlan>
      pages: number
    }
  | never
>

export const buildPaginate = ({ planRepository }: Adapter): Paginate => {
  return async ({ query, page = 1, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0
      }
    }

    const chats = await planRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity })
    })

    const pages = page
      ? Math.ceil(
          (await planRepository.count({
            where: query?.where
          })) / quantity
        )
      : 1

    return {
      data: chats,
      pages
    }
  }
}
