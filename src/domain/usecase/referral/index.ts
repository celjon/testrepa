import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'
import { buildWithdraw, Withdraw } from './withdraw'

export type ReferralUseCase = {
  create: Create
  delete: Delete
  list: List
  withdraw: Withdraw
}

export const buildReferralUseCase = (params: UseCaseParams): ReferralUseCase => {
  const create = buildCreate(params)
  const d = buildDelete(params)
  const list = buildList(params)
  const withdraw = buildWithdraw(params)

  return {
    create,
    delete: d,
    list,
    withdraw,
  }
}
