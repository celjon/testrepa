import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type SEOArticleExpertJobHistoryRepository = {
  create: Create
  get: Get
  update: Update
  updateMany: UpdateMany
  delete: Delete
}

export const buildSEOArticleExpertJobHistoryRepository = (params: Params): SEOArticleExpertJobHistoryRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const deleteAction = buildDelete(params)

  return {
    create,
    get,
    update,
    updateMany,
    delete: deleteAction
  }
}
