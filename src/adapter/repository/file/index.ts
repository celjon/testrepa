import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildCreateMany, CreateMany } from './create-many'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildDeleteMany, DeleteMany } from '@/adapter/repository/file/delete-many'

type Params = Pick<AdapterParams, 'db'>

export type FileRepository = {
  create: Create
  get: Get
  list: List
  update: Update
  delete: Delete
  createMany: CreateMany
  deleteMany: DeleteMany
}
export const buildFileRepository = (params: Params): FileRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const d = buildDelete(params)
  const createMany = buildCreateMany(params)
  const deleteMany = buildDeleteMany(params)

  return {
    create,
    get,
    list,
    update,
    delete: d,
    createMany,
    deleteMany,
  }
}
