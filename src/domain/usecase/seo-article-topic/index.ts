import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'

export type SEOArticleTopicUseCase = {
  getSEOArticleTopic: Get
  updateSEOArticleTopic: Update
  createSEOArticleTopic: Create
  deleteSEOArticleTopic: Delete
}

export const buildSEOArticleTopicUseCase = (params: UseCaseParams): SEOArticleTopicUseCase => {
  const getSEOArticleTopic = buildGet(params)
  const createSEOArticleTopic = buildCreate(params)
  const updateSEOArticleTopic = buildUpdate(params)
  const deleteSEOArticleTopic = buildDelete(params)
  return {
    getSEOArticleTopic,
    createSEOArticleTopic,
    updateSEOArticleTopic,
    deleteSEOArticleTopic,
  }
}
