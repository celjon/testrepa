import { IGroup } from '@/domain/entity/group'
import { UseCaseParams } from '../types'

export type List = (data: { userId: string; search?: string; page?: number; sort?: string; sortDirection?: string }) => Promise<{
  data: Array<IGroup>
  pages: number
}>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ userId, search, page, sort, sortDirection = 'desc' }) => {
    const groups = await service.group.paginate({
      query: {
        where: {
          user_id: userId,
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        orderBy: sort
          ? {
              [sort]: sortDirection
            }
          : {}
      },
      page
    })

    return groups
  }
}
