import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'
import { buildToExcel, ToExcel } from './toExcel'
import { buildChPaginate, ChPaginate } from './ch-paginate'

export type TransactionService = {
  toExcel: ToExcel
  paginate: Paginate
  chPaginate: ChPaginate
}
export const buildTransactionService = (params: Adapter): TransactionService => {
  const toExcel = buildToExcel(params)
  const paginate = buildPaginate(params)
  const chPaginate = buildChPaginate(params)

  return {
    toExcel,
    paginate,
    chPaginate,
  }
}
