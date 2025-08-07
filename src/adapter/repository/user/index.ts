import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildDelete, Delete } from './delete'
import { buildSetDisable, SetDisable } from './set-disable'
import { buildToExcel, ToExcel } from './to-excel'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'

type Params = Pick<AdapterParams, 'db'>

export type UserRepository = {
  count: Count
  create: Create
  delete: Delete
  get: Get
  list: List
  setDisable: SetDisable
  toExcel: ToExcel
  update: Update
}
export const buildUserRepository = (params: Params): UserRepository => {
  const count = buildCount(params)
  const create = buildCreate(params)
  const deleteUser = buildDelete(params)
  const get = buildGet(params)
  const list = buildList(params)
  const setDisable = buildSetDisable(params)
  const toExcel = buildToExcel()
  const update = buildUpdate(params)

  return {
    count,
    create,
    delete: deleteUser,
    get,
    list,
    setDisable,
    toExcel,
    update,
  }
}
