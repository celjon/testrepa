import { UseCaseParams } from '../types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'

export type ExchangeRateUseCase = {
  create: Create
  get: Get
  list: List
  update: Update
  delete: Delete
}

export const buildExchangeRateUseCase = (params: UseCaseParams): ExchangeRateUseCase => {
  return {
    create: buildCreate(params),
    get: buildGet(params),
    list: buildList(params),
    update: buildUpdate(params),
    delete: buildDelete(params),
  }
}
