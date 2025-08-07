import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDeleteMany, DeleteMany } from './delete-many'

type Params = Pick<AdapterParams, 'db'>

export type RefreshTokenRepository = {
  create: Create
  get: Get
  delete: Delete
  deleteMany: DeleteMany
  update: Update
}
export const buildRefreshTokenRepository = (params: Params): RefreshTokenRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteChat = buildDelete(params)
  const deleteMany = buildDeleteMany(params)

  return {
    create,
    get,
    update,
    delete: deleteChat,
    deleteMany,
  }
}
