import { AdapterParams } from '@/adapter/types'
import { buildCreatePreset, CreatePreset } from './create'
import { buildGetPreset, GetPreset } from './get'
import { buildListPresets, ListPresets } from './list'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildCount, Count } from './count'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpsert, Upsert } from './upsert'

type Params = Pick<AdapterParams, 'db'>

export type PresetRepository = {
  create: CreatePreset
  get: GetPreset
  list: ListPresets
  updateMany: UpdateMany
  count: Count
  delete: Delete
  update: Update
  upsert: Upsert
}

export const buildPresetRepository = (params: Params): PresetRepository => {
  const create = buildCreatePreset(params)
  const get = buildGetPreset(params)
  const list = buildListPresets(params)
  const updateMany = buildUpdateMany(params)
  const count = buildCount(params)
  const deletePreset = buildDelete(params)
  const update = buildUpdate(params)
  const upsert = buildUpsert(params)

  return {
    create,
    get,
    list,
    updateMany,
    count,
    delete: deletePreset,
    update,
    upsert
  }
}
