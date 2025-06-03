import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'
import { buildGetEmployeesStatsObservable, GetEmployeesStatsObservable } from '@/domain/service/enterprise/get-employees-stats-observable'

export type EnterpriseService = {
  paginate: Paginate
  getEmployeesStatsObservable: GetEmployeesStatsObservable
}
export const buildEnterpriseService = (params: Adapter): EnterpriseService => {
  const paginate = buildPaginate(params)
  const getEmployeesStatsObservable = buildGetEmployeesStatsObservable(params)

  return {
    paginate,
    getEmployeesStatsObservable
  }
}
