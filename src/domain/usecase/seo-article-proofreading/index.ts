import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'
import { buildCreateMany, CreateMany } from './create-many'

export type SEOArticleProofreadingUseCase = {
  getSEOArticleProofreading: Get
  updateSEOArticleProofreading: Update
  createSEOArticleProofreading: Create
  createManySEOArticleProofreading: CreateMany
  deleteSEOArticleProofreading: Delete
}

export const buildSEOArticleProofreadingUseCase = (
  params: UseCaseParams,
): SEOArticleProofreadingUseCase => {
  const getSEOArticleProofreading = buildGet(params)
  const createSEOArticleProofreading = buildCreate(params)
  const createManySEOArticleProofreading = buildCreateMany(params)
  const updateSEOArticleProofreading = buildUpdate(params)
  const deleteSEOArticleProofreading = buildDelete(params)
  return {
    getSEOArticleProofreading,
    createSEOArticleProofreading,
    createManySEOArticleProofreading,
    updateSEOArticleProofreading,
    deleteSEOArticleProofreading,
  }
}
