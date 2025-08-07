import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'

export type GroupService = {
  paginate: Paginate
}
export const buildGroupService = (params: Adapter): GroupService => {
  const paginate = buildPaginate(params)
  return {
    paginate,
  }
}
