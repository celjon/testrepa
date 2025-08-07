import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'

export type EmployeeGroupService = {
  paginate: Paginate
}
export const buildEmployeeGroupService = (params: Adapter): EmployeeGroupService => {
  const paginate = buildPaginate(params)

  return {
    paginate,
  }
}
