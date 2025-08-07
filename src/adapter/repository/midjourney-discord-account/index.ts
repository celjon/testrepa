import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildUpsert, Upsert } from './upsert'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildGetActiveIndex, GetActiveIndex } from './get-active-index'
import { buildSetActiveIndex, SetActiveIndex } from './set-active-index'

type Params = Pick<AdapterParams, 'db' | 'redis'>

export type MidjourneyDiscordAccountRepository = {
  create: Create
  get: Get
  delete: Delete
  update: Update
  updateMany: UpdateMany
  list: List
  count: Count
  upsert: Upsert
  deleteMany: DeleteMany
  getActiveIndex: GetActiveIndex
  setActiveIndex: SetActiveIndex
}

export const buildMidjourneyDiscordAccountRepository = (
  params: Params,
): MidjourneyDiscordAccountRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteMidjourneyDiscordAccount = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const count = buildCount(params)
  const upsert = buildUpsert(params)
  const getActiveIndex = buildGetActiveIndex(params)
  const setActiveIndex = buildSetActiveIndex(params)

  return {
    create,
    get,
    update,
    delete: deleteMidjourneyDiscordAccount,
    deleteMany,
    updateMany,
    list,
    count,
    upsert,
    getActiveIndex,
    setActiveIndex,
  }
}
