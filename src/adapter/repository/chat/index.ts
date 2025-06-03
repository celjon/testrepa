import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildUpsert, Upsert } from './upsert'
import { buildDeleteMany, DeleteMany } from './deleteMany'

type Params = Pick<AdapterParams, 'db' | 'redis'>

export type ChatRepository = {
  create: Create
  get: Get
  delete: Delete
  deleteMany: DeleteMany
  update: Update
  updateMany: UpdateMany
  list: List
  count: Count
  upsert: Upsert
}
export const buildChatRepository = (params: Params): ChatRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteChat = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const count = buildCount(params)
  const upsert = buildUpsert(params)

  return {
    create,
    get,
    update,
    delete: deleteChat,
    deleteMany,
    updateMany,
    list,
    count,
    upsert
  }
}
