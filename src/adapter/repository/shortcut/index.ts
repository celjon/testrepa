import { AdapterParams } from '@/adapter/types'
import { buildCreate, ShortcurRepositoryCreate } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type ShortcutRepository = {
  create: ShortcurRepositoryCreate
  delete: Delete
  update: Update
  list: List
  get: Get
  updateMany: UpdateMany
}
export const buildShortcutRepository = (params: Params): ShortcutRepository => {
  const create = buildCreate(params)
  const update = buildUpdate(params)
  const deleteShortcut = buildDelete(params)
  const list = buildList(params)
  const get = buildGet(params)
  const updateMany = buildUpdateMany(params)

  return {
    create,
    update,
    delete: deleteShortcut,
    list,
    get,
    updateMany,
  }
}
