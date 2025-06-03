import { AdapterParams } from '@/adapter/types'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildCount, Count } from './count'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpsert, Upsert } from './upsert'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildList, List } from './list'

type Params = Pick<AdapterParams, 'db'>

export type PresetCategoryRepository = {
  create: Create
  get: Get
  list: List
  updateMany: UpdateMany
  count: Count
  delete: Delete
  update: Update
  upsert: Upsert
}

export const buildPresetCategoryRepository = (params: Params): PresetCategoryRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const list = buildList(params)
  const updateMany = buildUpdateMany(params)
  const count = buildCount(params)
  const deleteCategory = buildDelete(params)
  const update = buildUpdate(params)
  const upsert = buildUpsert(params)

  return {
    create,
    get,
    list,
    updateMany,
    count,
    delete: deleteCategory,
    update,
    upsert
  }
}
