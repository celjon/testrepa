import { AdapterParams } from '@/adapter/types'
import { buildUpdate, Update } from './update'
import { buildGet, Get } from './get'
import { buildCreate, Create } from './create'
import { buildUpsert, Upsert } from './upsert'

type Params = Pick<AdapterParams, 'db'>

export type ChatSettingsRepository = {
  create: Create
  upsert: Upsert
  update: Update
  get: Get
}
export const buildChatSettingsRepository = (params: Params): ChatSettingsRepository => {
  const create = buildCreate(params)
  const upsert = buildUpsert(params)
  const update = buildUpdate(params)
  const get = buildGet(params)

  return {
    create,
    upsert,
    update,
    get,
  }
}
