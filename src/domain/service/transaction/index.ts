import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'
import { buildToExcel, ToExcel } from './toExcel'

export type TransactionService = {
  toExcel: ToExcel
  paginate: Paginate
}
export const buildTransactionService = (params: Adapter): TransactionService => {
  const toExcel = buildToExcel(params)
  const paginate = buildPaginate(params)

  return {
    toExcel,
    paginate
  }
}
