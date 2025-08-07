import { AdapterParams } from '@/adapter/types'
import { buildCreateEnterprise, CreateEnterprise } from './create'
import { buildUpdateEnterprise, UpdateEnterprise } from './update'
import { buildListEnterprises, ListEnterprises } from './list'
import { buildGetEnterprise, GetEnterprise } from './get'
import { buildCountEnterprises, CountEnterprises } from './count'
import { buildGetAllEnterprise, GetAllEnterprise } from './get-all'
import { buildGetEnterpriseStats, GetEnterpriseStats } from './get-enterprise-stats'
import {
  buildGetEnterpriseEmployeesTransactions,
  GetEnterpriseEmployeesTransactions,
} from './get-enterprise-employees-transactions'
import {
  buildGetEnterpriseSpendsForAllEnterprises,
  GetEnterpriseSpendsForAllEnterprises,
} from './get-enterprise-spends-for-all-enterprises'
import {
  buildGetEnterpriseTokensCredited,
  GetEnterpriseTokensCredited,
} from './get-enterprise-tokens-credited'
import {
  buildChGetEnterpriseEmployeesTransactions,
  ChGetEnterpriseEmployeesTransactions,
} from './ch-get-enterprise-employees-transactions'
import {
  buildChGetEnterpriseTokensCredited,
  ChGetEnterpriseTokensCredited,
} from './ch-get-enterprise-tokens-credited'
import {
  buildChGetEnterpriseSpendsForAllEnterprises,
  ChGetEnterpriseSpendsForAllEnterprises,
} from './ch-get-enterprise-spends-for-all-enterprises'
import { buildChGetEnterpriseStats, ChGetEnterpriseStats } from './ch-get-enterprise-stats'

type Params = Pick<AdapterParams, 'db' | 'clickhouse'>

export type EnterpriseRepository = {
  create: CreateEnterprise
  update: UpdateEnterprise
  list: ListEnterprises
  get: GetEnterprise
  getAll: GetAllEnterprise
  count: CountEnterprises
  getEnterpriseStats: GetEnterpriseStats
  getEnterpriseEmployeesTransactions: GetEnterpriseEmployeesTransactions
  getEnterpriseSpendsForAllEnterprises: GetEnterpriseSpendsForAllEnterprises
  getEnterpriseTokensCredited: GetEnterpriseTokensCredited
  chGetEnterpriseStats: ChGetEnterpriseStats
  chGetEnterpriseTokensCredited: ChGetEnterpriseTokensCredited
  chGetEnterpriseEmployeesTransactions: ChGetEnterpriseEmployeesTransactions
  chGetEnterpriseSpendsForAllEnterprises: ChGetEnterpriseSpendsForAllEnterprises
}
export const buildEnterpriseRepository = (params: Params): EnterpriseRepository => {
  const create = buildCreateEnterprise(params)
  const update = buildUpdateEnterprise(params)
  const list = buildListEnterprises(params)
  const get = buildGetEnterprise(params)
  const getAll = buildGetAllEnterprise(params)
  const count = buildCountEnterprises(params)
  const getEnterpriseStats = buildGetEnterpriseStats(params)
  const getEnterpriseEmployeesTransactions = buildGetEnterpriseEmployeesTransactions(params)
  const getEnterpriseSpendsForAllEnterprises = buildGetEnterpriseSpendsForAllEnterprises(params)
  const getEnterpriseTokensCredited = buildGetEnterpriseTokensCredited(params)
  const chGetEnterpriseStats = buildChGetEnterpriseStats(params)
  const chGetEnterpriseTokensCredited = buildChGetEnterpriseTokensCredited(params)
  const chGetEnterpriseEmployeesTransactions = buildChGetEnterpriseEmployeesTransactions(params)
  const chGetEnterpriseSpendsForAllEnterprises = buildChGetEnterpriseSpendsForAllEnterprises(params)

  return {
    create,
    update,
    list,
    get,
    getAll,
    count,
    getEnterpriseStats,
    getEnterpriseEmployeesTransactions,
    getEnterpriseSpendsForAllEnterprises,
    getEnterpriseTokensCredited,
    chGetEnterpriseStats,
    chGetEnterpriseTokensCredited,
    chGetEnterpriseEmployeesTransactions,
    chGetEnterpriseSpendsForAllEnterprises,
  }
}
