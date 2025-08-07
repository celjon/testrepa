import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildGetPlatformTokens, GetPlatformTokens } from './get-platform-tokens'
import { buildGetTokensByModel, GetTokensByModel } from './get-tokens-by-model'
import { buildGetProductUsage, GetProductUsage } from './get-product-usage'
import { buildGetG4FProductUsage, GetG4FProductUsage } from './get-g4f-product-usage'
import {
  buildGetG4FExtendedProductUsage,
  GetG4FExtendedProductUsage,
} from './get-g4f-extended-product-usage'
import { buildChGetPlatformTokens, ChGetPlatformTokens } from './ch-get-platform-tokens'
import { buildChGetTokensByModel, ChGetTokensByModel } from './ch-get-tokens-by-model'
import {
  buildChGetProductUsage,
  ChGetProductUsage,
} from '@/adapter/repository/action/ch-get-product-usage'

type Params = Pick<AdapterParams, 'db' | 'clickhouse'>

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
  getG4FProductUsage: GetG4FProductUsage
  getG4FExtendedProductUsage: GetG4FExtendedProductUsage

  //clickhouse
  chGetProductUsage: ChGetProductUsage
  chGetTokensByModel: ChGetTokensByModel
  chGetPlatformTokens: ChGetPlatformTokens
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

  const chGetTokensByModel = buildChGetTokensByModel(params)
  const chGetPlatformTokens = buildChGetPlatformTokens(params)
  const chGetProductUsage = buildChGetProductUsage(params)

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
    getProductUsage: buildGetProductUsage(params),
    getG4FExtendedProductUsage: buildGetG4FExtendedProductUsage(params),
    getG4FProductUsage: buildGetG4FProductUsage(params),

    chGetProductUsage,
    chGetTokensByModel,
    chGetPlatformTokens,
  }
}
