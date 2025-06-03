import { Adapter, GroupRepository } from '@/domain/types'
import { IGroup } from '@/domain/entity/group'

export type Paginate = (data: { query: Parameters<GroupRepository['list']>[0]; page?: number; quantity?: number }) => Promise<
  | {
      data: Array<IGroup>
      pages: number
    }
  | never
>

export const buildPaginate = ({ groupRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0
      }
    }

    const data = await groupRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity })
    })

    const pages = page
      ? Math.ceil(
          (await groupRepository.count({
            where: query?.where
          })) / quantity
        )
      : 1

    return {
      data,
      pages
    }
  }
}
