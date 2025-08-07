import { Adapter, ChatRepository } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'

export type Paginate = (data: {
  query: Parameters<ChatRepository['list']>[0]
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<IChat>
      pages: number
    }
  | never
>

export const buildPaginate = ({ chatRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await chatRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })

    const pages = page
      ? Math.ceil(
          (await chatRepository.count({
            where: query?.where,
          })) / quantity,
        )
      : 1

    return {
      data,
      pages,
    }
  }
}
