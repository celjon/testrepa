import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'

export type SEOArticleExpertJobHistoryUseCase = {
  getSEOArticleExpertJobHistory: Get
  updateSEOArticleExpertJobHistory: Update
  createSEOArticleExpertJobHistory: Create
  deleteSEOArticleExpertJobHistory: Delete
}

export const buildSEOArticleExpertJobHistoryUseCase = (params: UseCaseParams): SEOArticleExpertJobHistoryUseCase => {
  const getSEOArticleExpertJobHistory = buildGet(params)
  const createSEOArticleExpertJobHistory = buildCreate(params)
  const updateSEOArticleExpertJobHistory = buildUpdate(params)
  const deleteSEOArticleExpertJobHistory = buildDelete(params)
  return {
    getSEOArticleExpertJobHistory,
    createSEOArticleExpertJobHistory,
    updateSEOArticleExpertJobHistory,
    deleteSEOArticleExpertJobHistory
  }
}
