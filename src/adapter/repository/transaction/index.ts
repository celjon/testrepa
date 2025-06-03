import { AdapterParams } from '@/adapter/types'
import { buildUpdateTransaction, UpdateTransaction } from './update'
import { buildCreateTransaction, CreateTransaction } from './create'
import { buildCreateMany, CreateMany } from './createMany'
import { buildToExcel, ToExcel } from './toExcel'
import { buildGetTransaction, GetTransaction } from './get'
import { buildList, List } from './list'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildGroupByTransaction, GroupByTransaction } from './groupBy'

type Params = Pick<AdapterParams, 'db' | 'yoomoney'>

export type TransactionRepository = {
  create: CreateTransaction
  update: UpdateTransaction
  get: GetTransaction
  groupBy: GroupByTransaction
  list: List
  count: Count
  createMany: CreateMany
  updateMany: UpdateMany
  toExcel: ToExcel
}
export const buildTransactionRepository = (params: Params): TransactionRepository => {
  const create = buildCreateTransaction(params)
  const update = buildUpdateTransaction(params)
  const get = buildGetTransaction(params)
  const groupBy = buildGroupByTransaction(params)
  const list = buildList(params)
  const count = buildCount(params)
  const createMany = buildCreateMany(params)
  const updateMany = buildUpdateMany(params)
  const toExcel = buildToExcel()
  return {
    create,
    update,
    get,
    groupBy,
    list,
    count,
    createMany,
    updateMany,
    toExcel
  }
}
