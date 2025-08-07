import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildUpsert, Upsert } from './upsert'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildGet, Get } from './get'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer'>

export type ModelFunctionRepository = {
  list: List
  get: Get
  create: Create
  deleteMany: DeleteMany
  upsert: Upsert
  update: Update
}
export const buildModelFunctionRepository = (params: Params): ModelFunctionRepository => {
  const list = buildList(params)
  const get = buildGet(params)
  const create = buildCreate(params)
  const deleteMany = buildDeleteMany(params)
  const upsert = buildUpsert(params)
  const update = buildUpdate(params)
  return {
    list,
    get,
    create,
    deleteMany,
    upsert,
    update,
  }
}
