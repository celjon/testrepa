import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildGetPlatformTokens, GetPlatformTokens } from './getPlatformTokens'
import { buildGetTokensByModel, GetTokensByModel } from './getTokensByModel'
import { buildGetProductUsage, GetProductUsage } from './get-product-usage'

type Params = Pick<AdapterParams, 'db'>

export type ActionRepository = {
  create: Create
  get: Get
  delete: Delete
  update: Update
  updateMany: UpdateMany
  list: List
  count: Count
  getPlatformTokens: GetPlatformTokens
  getTokensByModel: GetTokensByModel
  getProductUsage: GetProductUsage
}

export const buildActionRepository = (params: Params): ActionRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const deleteAction = buildDelete(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const count = buildCount(params)
  const getPlatformTokens = buildGetPlatformTokens(params)
  const getTokensByModel = buildGetTokensByModel(params)

  return {
    create,
    get,
    update,
    delete: deleteAction,
    updateMany,
    list,
    count,
    getPlatformTokens,
    getTokensByModel,
    getProductUsage: buildGetProductUsage(params)
  }
}
