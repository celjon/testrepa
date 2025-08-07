import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'

type Params = Pick<AdapterParams, 'db'>

export type ExchangeRateRepository = {
  create: Create
  get: Get
  list: List
  update: Update
  delete: Delete
}

export const buildExchangeRateRepository = (params: Params): ExchangeRateRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const deleteRate = buildDelete(params)

  return {
    create,
    get,
    list,
    update,
    delete: deleteRate,
  }
}
