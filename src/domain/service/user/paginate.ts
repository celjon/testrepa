import { Adapter, UserRepository } from '@/domain/types'
import { IUser } from '@/domain/entity/user'

export type Paginate = (data: { query: Parameters<UserRepository['list']>[0]; page?: number; quantity?: number }) => Promise<
  | {
      data: Array<IUser>
      pages: number
    }
  | never
>

export const buildPaginate = ({ userRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0
      }
    }

    const data = await userRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity })
    })

    const pages = page
      ? Math.ceil(
          (await userRepository.count({
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
