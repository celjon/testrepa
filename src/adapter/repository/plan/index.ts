import { AdapterParams } from '@/adapter/types'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildCount, Count } from './count'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildUpdate, Update } from './update'

type Params = Pick<AdapterParams, 'db'>

export type PlanRepository = {
  list: List
  get: Get
  count: Count
  updateMany: UpdateMany
  update: Update
}
export const buildPlanRepository = (params: Params): PlanRepository => {
  const list = buildList(params)
  const get = buildGet(params)
  const count = buildCount(params)
  const updateMany = buildUpdateMany(params)
  const update = buildUpdate(params)
  return {
    list,
    get,
    count,
    updateMany,
    update
  }
}
