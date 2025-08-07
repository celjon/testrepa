import { Adapter, EmployeeRepository } from '@/domain/types'
import { IEmployee } from '@/domain/entity/employee'

export type Paginate = (data: {
  query: Parameters<EmployeeRepository['list']>[0]
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<IEmployee>
      pages: number
    }
  | never
>

export const buildPaginate = ({ employeeRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await employeeRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })

    const pages = page
      ? Math.ceil(
          (await employeeRepository.count({
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
