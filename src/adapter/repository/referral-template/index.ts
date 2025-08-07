import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'

type Params = Pick<AdapterParams, 'db'>

export type ReferralTemplateRepository = {
  create: Create
  list: List
  count: Count
  delete: Delete
  get: Get
  update: Update
}
export const buildReferralTemplateRepository = (params: Params): ReferralTemplateRepository => {
  const create = buildCreate(params)
  const list = buildList(params)
  const count = buildCount(params)
  const d = buildDelete(params)
  const update = buildUpdate(params)

  return {
    create,
    list,
    count,
    get: buildGet(params),
    delete: d,
    update,
  }
}
