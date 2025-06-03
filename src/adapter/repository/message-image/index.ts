import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildCount, Count } from './count'
import { buildGet, Get } from './get'

type Params = Pick<AdapterParams, 'db'>

export type MessageImageRepository = {
  get: Get
  create: Create
  updateMany: UpdateMany
  update: Update
  list: List
  count: Count
}

export const buildMessageImageRepository = (params: Params): MessageImageRepository => {
  const get = buildGet(params)
  const create = buildCreate(params)
  const updateMany = buildUpdateMany(params)
  const update = buildUpdate(params)
  const list = buildList(params)
  const count = buildCount(params)

  return {
    get,
    create,
    updateMany,
    update,
    list,
    count
  }
}
