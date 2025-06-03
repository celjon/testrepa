import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildFindMany, FindMany } from './find-many'
import { buildCount, Count } from './count'
import { buildList, List } from './list'
import { buildDeleteMany, DeleteMany } from './delete-many'

type Params = Pick<AdapterParams, 'db'>

export type ArticleRepository = {
  create: Create
  get: Get
  findMany: FindMany
  count: Count
  list: List
  update: Update
  updateMany: UpdateMany
  delete: Delete
  deleteMany: DeleteMany
}

export const buildArticleRepository = (params: Params): ArticleRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const findMany = buildFindMany(params)
  const count = buildCount(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const deleteAction = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  return {
    create,
    get,
    findMany,
    count,
    list,
    update,
    updateMany,
    delete: deleteAction,
    deleteMany
  }
}
