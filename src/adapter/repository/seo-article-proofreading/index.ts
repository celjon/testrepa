import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildCreateMany, CreateMany } from './create-many'

type Params = Pick<AdapterParams, 'db'>

export type SEOArticleProofreadingRepository = {
  create: Create
  get: Get
  update: Update
  updateMany: UpdateMany
  createMany: CreateMany
  delete: Delete
}

export const buildSEOArticleProofreadingRepository = (
  params: Params,
): SEOArticleProofreadingRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const createMany = buildCreateMany(params)
  const deleteAction = buildDelete(params)
  return {
    create,
    get,
    update,
    updateMany,
    createMany,
    delete: deleteAction,
  }
}
