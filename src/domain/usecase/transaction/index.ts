import { UseCaseParams } from '@/domain/usecase/types'
import { buildList, List } from './list'
import { buildExcel, Excel } from './excel'
import { buildListWithdraw, ListWithdraw } from './list-withdraw'
import { buildReject, Reject } from './reject'
import { buildSubmit, Submit } from './submit'
import { buildListById, ListById } from './list-by-id'
import {
  buildGetUserSpendingByDeveloperKeyLabel,
  GetUserSpendingByDeveloperKeyLabel,
} from './get-user-spending-by-developer-key-label'

export type TransactionUseCase = {
  list: List
  listWithdraw: ListWithdraw
  reject: Reject
  submit: Submit
  excel: Excel
  listById: ListById
  getAggregatedUserSpendingStatsExcelByDeveloperKey: GetUserSpendingByDeveloperKeyLabel
}

export const buildTransactionUseCase = (params: UseCaseParams): TransactionUseCase => {
  const list = buildList(params)
  const excel = buildExcel(params)
  const listWithdraw = buildListWithdraw(params)
  const reject = buildReject(params)
  const submit = buildSubmit(params)
  const listById = buildListById(params)
  const getAggregatedUserSpendingStatsExcelByDeveloperKey =
    buildGetUserSpendingByDeveloperKeyLabel(params)

  return {
    list,
    listWithdraw,
    reject,
    submit,
    excel,
    listById,
    getAggregatedUserSpendingStatsExcelByDeveloperKey,
  }
}
