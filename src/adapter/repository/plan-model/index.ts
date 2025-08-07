import { AdapterParams } from '@/adapter/types'
import { buildCreateMany, CreateMany } from './create-many'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildGet, Get } from './get'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildList, List } from './list'
import { buildUpsert, Upsert } from './upsert'
import { buildCreate, Create } from './create'

type Params = Pick<AdapterParams, 'db'>

export type PlanModelRepository = {
  create: Create
  createMany: CreateMany
  deleteMany: DeleteMany
  get: Get
  updateMany: UpdateMany
  list: List
  upsert: Upsert
}
export const buildPlanModelRepository = (params: Params): PlanModelRepository => {
  const create = buildCreate(params)
  const deleteMany = buildDeleteMany(params)
  const createMany = buildCreateMany(params)
  const get = buildGet(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const upsert = buildUpsert(params)

  return {
    create,
    deleteMany,
    createMany,
    get,
    updateMany,
    list,
    upsert,
  }
}
