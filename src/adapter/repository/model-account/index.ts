import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildUpsert, Upsert } from './upsert'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildDelete, Delete } from './delete'
import { AddG4FAccountRequest, buildAddG4FAccountRequest } from './add-g4f-account-request'
import { buildGetG4FAccountStats, GetG4FAccountStats } from './get-g4f-account-stats'
import { buildDeleteG4FAccountRequest, DeleteG4FAccountRequest } from './delete-g4f-account-request'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer' | 'redis'>

export type ModelAccountRepository = {
  list: List
  get: Get
  create: Create
  delete: Delete
  deleteMany: DeleteMany
  upsert: Upsert
  update: Update
  updateMany: UpdateMany
  count: Count
  getG4FAccountStats: GetG4FAccountStats
  addG4FAccountRequest: AddG4FAccountRequest
  deleteG4FAccountRequest: DeleteG4FAccountRequest
}

export const buildModelAccountRepository = (params: Params): ModelAccountRepository => {
  const list = buildList(params)
  const get = buildGet(params)
  const create = buildCreate(params)
  const d = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const upsert = buildUpsert(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const count = buildCount(params)

  return {
    list,
    get,
    create,
    delete: d,
    deleteMany,
    upsert,
    update,
    updateMany,
    count,
    getG4FAccountStats: buildGetG4FAccountStats(params),
    addG4FAccountRequest: buildAddG4FAccountRequest(params),
    deleteG4FAccountRequest: buildDeleteG4FAccountRequest(params),
  }
}
