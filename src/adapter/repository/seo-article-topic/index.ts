import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildCreateMany, CreateMany } from './create-many'
import { buildFindByLocalizedKeywords, FindByLocalizedKeywords } from './find-by-localized-keywords'

type Params = Pick<AdapterParams, 'db'>

export type SEOArticleTopicRepository = {
  create: Create
  createMany: CreateMany
  get: Get
  findByLocalizedKeywords: FindByLocalizedKeywords
  update: Update
  updateMany: UpdateMany
  delete: Delete
}

export const buildSEOArticleTopicRepository = (params: Params): SEOArticleTopicRepository => {
  const create = buildCreate(params)
  const createMany = buildCreateMany(params)
  const get = buildGet(params)
  const findByLocalizedKeywords = buildFindByLocalizedKeywords(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  const deleteTopic = buildDelete(params)

  return {
    create,
    createMany,
    get,
    findByLocalizedKeywords,
    update,
    updateMany,
    delete: deleteTopic,
  }
}
