import { AdapterParams } from '@/adapter/types'
import { buildCreateEnterprise, CreateEnterprise } from './create'
import { buildUpdateEnterprise, UpdateEnterprise } from './update'
import { buildListEnterprises, ListEnterprises } from './list'
import { buildGetEnterprise, GetEnterprise } from './get'
import { buildCountEnterprises, CountEnterprises } from './count'
import { buildGetAllEnterprise, GetAllEnterprise } from '@/adapter/repository/enterprise/get-all'
import {
  buildGetEnterpriseStats,
  GetEnterpriseStats
} from '@/adapter/repository/enterprise/get-aggregate-enterprise-stats'
import {
  buildGetAggregateEnterpriseEmployeesTransactions,
  GetAggregateEnterpriseEmployeesTransactions
} from '@/adapter/repository/enterprise/get-aggregate-enterprise-employees-transactions'
import {
  buildGetAggregateEnterpriseTokensUsedForAllEnterprises,
  GetAggregateEnterpriseTokensUsedForAllEnterprises
} from '@/adapter/repository/enterprise/get-aggregate-enterprise-tokens-used- for-all-enterprises'
import {
  buildGetAggregateEnterpriseTokensCredited,
  GetAggregateEnterpriseTokensCredited
} from '@/adapter/repository/enterprise/get-aggregate-enterprise-tokens-credited'

type Params = Pick<AdapterParams, 'db'>

export type EnterpriseRepository = {
  create: CreateEnterprise
  update: UpdateEnterprise
  list: ListEnterprises
  get: GetEnterprise
  getAll: GetAllEnterprise
  count: CountEnterprises
  getEnterpriseStats: GetEnterpriseStats
  getAggregateEnterpriseEmployeesTransactions: GetAggregateEnterpriseEmployeesTransactions
  getAggregateEnterpriseTokensUsedForAllEnterprises: GetAggregateEnterpriseTokensUsedForAllEnterprises
  getAggregateEnterpriseTokensCredited: GetAggregateEnterpriseTokensCredited
}
export const buildEnterpriseRepository = (params: Params): EnterpriseRepository => {
  const create = buildCreateEnterprise(params)
  const update = buildUpdateEnterprise(params)
  const list = buildListEnterprises(params)
  const get = buildGetEnterprise(params)
  const getAll = buildGetAllEnterprise(params)
  const count = buildCountEnterprises(params)
  const getAggregateEnterpriseStats = buildGetEnterpriseStats(params)
  const getAggregateEnterpriseEmployeesTransactions = buildGetAggregateEnterpriseEmployeesTransactions(params)
  const getAggregateEnterpriseTokensUsedForAllEnterprises = buildGetAggregateEnterpriseTokensUsedForAllEnterprises(params)
  const getAggregateEnterpriseTokensCredited = buildGetAggregateEnterpriseTokensCredited(params)

  return {
    create,
    update,
    list,
    get,
    getAll,
    count,
    getEnterpriseStats: getAggregateEnterpriseStats,
    getAggregateEnterpriseEmployeesTransactions,
    getAggregateEnterpriseTokensUsedForAllEnterprises,
    getAggregateEnterpriseTokensCredited
  }
}
