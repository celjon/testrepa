import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'

type Params = Pick<AdapterParams, 'db'>

export type EnterpriseUsageConstraintsRepository = {
  create: Create
  get: Get
  delete: Delete
  update: Update
  list: List
  count: Count
}
export const buildEnterpriseUsageConstraintsRepository = (params: Params): EnterpriseUsageConstraintsRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteEnterpriseUsageConstraints = buildDelete(params)
  const list = buildList(params)
  const count = buildCount(params)

  return {
    create,
    get,
    update,
    delete: deleteEnterpriseUsageConstraints,
    list,
    count
  }
}
