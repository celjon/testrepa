import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildDelete, Delete } from './delete'
import { buildCount, Count } from './count'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildDeleteMany, DeleteMany } from './delete-many'

type Params = Pick<AdapterParams, 'db'>

export type GroupRepository = {
  create: Create
  get: Get
  list: List
  delete: Delete
  deleteMany: DeleteMany
  updateMany: UpdateMany
  count: Count
  update: Update
}
export const buildGroupRepository = (params: Params): GroupRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const list = buildList(params)
  const del = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const updateMany = buildUpdateMany(params)
  const count = buildCount(params)
  const update = buildUpdate(params)

  return {
    create,
    get,
    list,
    delete: del,
    deleteMany,
    updateMany,
    count,
    update,
  }
}
