import { Adapter } from '@/domain/types'
import { IEmployeeGroup } from '@/domain/entity/employee-group'
import { EmployeeGroupRepository } from '@/adapter/repository/employee-group'

export type Paginate = (data: {
  query: Parameters<EmployeeGroupRepository['list']>[0]
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<IEmployeeGroup>
      pages: number
    }
  | never
>

export const buildPaginate = ({ employeeGroupRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await employeeGroupRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })

    const pages = page
      ? Math.ceil(
          (await employeeGroupRepository.count({
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
