import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildUpsert, Upsert } from './upsert'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildCount, Count } from './count'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer'>

export type ModelAccountQueueRepository = {
  list: List
  get: Get
  create: Create
  deleteMany: DeleteMany
  upsert: Upsert
  update: Update
  count: Count
}

export const buildModelAccountQueueRepository = (params: Params): ModelAccountQueueRepository => {
  const list = buildList(params)
  const get = buildGet(params)
  const create = buildCreate(params)
  const deleteMany = buildDeleteMany(params)
  const upsert = buildUpsert(params)
  const update = buildUpdate(params)
  const count = buildCount(params)

  return {
    list,
    get,
    create,
    deleteMany,
    upsert,
    update,
    count,
  }
}
