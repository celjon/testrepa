import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'

export type EmployeeService = {
  paginate: Paginate
}
export const buildEmployeeService = (params: Adapter): EmployeeService => {
  const paginate = buildPaginate(params)

  return {
    paginate
  }
}
