import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'
import { buildFindBySlug, FindBySlug } from './find-by-slug'

export type SEOArticleExpertUseCase = {
  getSEOArticleExpert: Get
  findBySlug: FindBySlug
  updateSEOArticleExpert: Update
  createSEOArticleExpert: Create
  deleteSEOArticleExpert: Delete
}

export const buildSEOArticleExpertUseCase = (params: UseCaseParams): SEOArticleExpertUseCase => {
  const getSEOArticleExpert = buildGet(params)
  const findBySlug = buildFindBySlug(params)
  const createSEOArticleExpert = buildCreate(params)
  const updateSEOArticleExpert = buildUpdate(params)
  const deleteSEOArticleExpert = buildDelete(params)
  return {
    getSEOArticleExpert,
    findBySlug,
    createSEOArticleExpert,
    updateSEOArticleExpert,
    deleteSEOArticleExpert
  }
}
