import { Adapter } from '@/adapter'
import { buildPaginate, Paginate } from './paginate'
import {
  buildGetEmployeesStatsObservable,
  GetEmployeesStatsObservable,
} from './get-employees-stats-observable'
import { buildCheckMonthLimit, CheckMonthLimit } from './check-month-limit'

export type EnterpriseService = {
  paginate: Paginate
  getEmployeesStatsObservable: GetEmployeesStatsObservable
  checkMonthLimit: CheckMonthLimit
}
export const buildEnterpriseService = (params: Adapter): EnterpriseService => {
  const paginate = buildPaginate(params)
  const getEmployeesStatsObservable = buildGetEmployeesStatsObservable(params)
  const checkMonthLimit = buildCheckMonthLimit(params)

  return {
    paginate,
    getEmployeesStatsObservable,
    checkMonthLimit,
  }
}
