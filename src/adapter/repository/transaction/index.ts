import { AdapterParams } from '@/adapter/types'
import { buildUpdateTransaction, UpdateTransaction } from './update'
import { buildCreateTransaction, CreateTransaction } from './create'
import { buildToExcel, ToExcel } from './to-excel'
import { buildGetTransaction, GetTransaction } from './get'
import { buildList, List } from './list'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildGroupByTransaction, GroupByTransaction } from './group-by'
import {
  buildUserSpendingStatsExcelByDeveloperKey,
  UserSpendingStatsExcelByDeveloperKey,
} from './user-spending-stats-excel-by-developer-key'
import {
  buildChUserSpendingStatsExcelByDeveloperKey,
  ChUserSpendingStatsExcelByDeveloperKey,
} from './ch-user-spending-stats-excel-by-developer-key'
import { buildChBulkUpdateUserId, ChBulkUpdateUserId } from './ch-bulk-update-user-id'
import { buildChCount, ChCount } from './ch-count'
import { buildChCreateTransaction, ChCreateTransaction } from './ch-create'
import { buildChList, ChList } from './ch-list'
import { buildClickHouseToPrisma } from '@/adapter/repository/transaction/clickhouse-to-prisma'
import { ClickHouseToPrisma } from './clickhouse-to-prisma'

type Params = Pick<AdapterParams, 'db' | 'clickhouse' | 'yoomoney'>

export type TransactionRepository = {
  create: CreateTransaction
  update: UpdateTransaction
  get: GetTransaction
  groupBy: GroupByTransaction
  list: List
  count: Count
  updateMany: UpdateMany
  toExcel: ToExcel
  getUserSpendingByDeveloperKeyLabel: UserSpendingStatsExcelByDeveloperKey

  clickhouseToPrisma: ClickHouseToPrisma
  chList: ChList
  chCount: ChCount
  chCreate: ChCreateTransaction
  chBulkUpdateUserId: ChBulkUpdateUserId
  chGetUserSpendingByDeveloperKeyLabel: ChUserSpendingStatsExcelByDeveloperKey
}
export const buildTransactionRepository = (params: Params): TransactionRepository => {
  const create = buildCreateTransaction(params)
  const update = buildUpdateTransaction(params)
  const get = buildGetTransaction(params)
  const groupBy = buildGroupByTransaction(params)
  const list = buildList(params)
  const count = buildCount(params)
  const updateMany = buildUpdateMany(params)
  const toExcel = buildToExcel()
  const getUserSpendingByDeveloperKeyLabel = buildUserSpendingStatsExcelByDeveloperKey(params)

  const clickhouseToPrisma = buildClickHouseToPrisma()
  const chList = buildChList({ clickhouseToPrisma, ...params })
  const chCount = buildChCount(params)
  const chCreate = buildChCreateTransaction(params)
  const chBulkUpdateUserId = buildChBulkUpdateUserId(params)
  const chGetUserSpendingByDeveloperKeyLabel = buildChUserSpendingStatsExcelByDeveloperKey(params)
  return {
    create,
    update,
    get,
    groupBy,
    list,
    count,
    updateMany,
    toExcel,
    getUserSpendingByDeveloperKeyLabel,

    clickhouseToPrisma,
    chList,
    chCount,
    chCreate,
    chBulkUpdateUserId,
    chGetUserSpendingByDeveloperKeyLabel,
  }
}
