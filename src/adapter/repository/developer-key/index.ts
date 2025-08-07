import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildList, List } from './list'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type DeveloperKeyRepository = {
  create: Create
  list: List
  get: Get
  update: Update
  updateMany: UpdateMany
}
export const buildDeveloperKeyRepository = (params: Params): DeveloperKeyRepository => {
  const create = buildCreate(params)
  const list = buildList(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)

  return {
    list,
    create,
    get,
    update,
    updateMany,
  }
}
