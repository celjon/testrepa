import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './updateMany'

type Params = Pick<AdapterParams, 'db'>

export type ReferralRepository = {
  create: Create
  list: List
  delete: Delete
  get: Get
  update: Update
  updateMany: UpdateMany
}
export const buildReferralRepository = (params: Params): ReferralRepository => {
  const create = buildCreate(params)
  const list = buildList(params)
  const d = buildDelete(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  return {
    create,
    list,
    delete: d,
    get,
    update,
    updateMany
  }
}
