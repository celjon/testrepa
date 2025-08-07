import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildUpsert, Upsert } from './upsert'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildUpdatePopularityScores, UpdatePopularityScores } from './update-popularity-scores'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer'>

export type ModelRepository = {
  list: List
  get: Get
  create: Create
  deleteMany: DeleteMany
  upsert: Upsert
  update: Update
  updateMany: UpdateMany
  count: Count
  updatePopularityScores: UpdatePopularityScores
}

export const buildModelRepository = (params: Params): ModelRepository => {
  const list = buildList(params)
  const get = buildGet(params)
  const create = buildCreate(params)
  const deleteMany = buildDeleteMany(params)
  const upsert = buildUpsert(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const count = buildCount(params)

  return {
    list,
    get,
    create,
    deleteMany,
    upsert,
    update,
    updateMany,
    count,
    updatePopularityScores: buildUpdatePopularityScores(params),
  }
}
