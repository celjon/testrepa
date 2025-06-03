import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildList, List } from './list'
import { buildCount, Count } from './count'

type Params = Pick<AdapterParams, 'db'>

export type SEOArticleCategoryRepository = {
  create: Create
  get: Get
  count: Count
  list: List
  update: Update
  updateMany: UpdateMany
  delete: Delete
}

export const buildSEOArticleCategoryRepository = (params: Params): SEOArticleCategoryRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const count = buildCount(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const deleteCategory = buildDelete(params)

  return {
    create,
    get,
    count,
    list,
    update,
    updateMany,
    delete: deleteCategory
  }
}
