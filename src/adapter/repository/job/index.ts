import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type JobRepository = {
  create: Create
  get: Get
  delete: Delete
  update: Update
  updateMany: UpdateMany
  list: List
  count: Count
}
export const buildJobRepository = (params: Params): JobRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteJob = buildDelete(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const count = buildCount(params)

  return {
    create,
    get,
    update,
    delete: deleteJob,
    updateMany,
    list,
    count,
  }
}
