import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDeleteMany, DeleteMany } from './deleteMany'
import { buildUpsert, Upsert } from './upsert'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildDelete, Delete } from './delete'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer'>

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
    count
  }
}
