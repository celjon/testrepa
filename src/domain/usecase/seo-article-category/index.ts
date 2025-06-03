import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'
import { buildList, List } from './list'
import { buildFindBySlug, FindBySlug } from './find-by-slug'

export type SEOArticleCategoryUseCase = {
  getSEOArticleCategory: Get
  listSEOArticleCategory: List
  updateSEOArticleCategory: Update
  createSEOArticleCategory: Create
  deleteSEOArticleCategory: Delete
  findBySlug: FindBySlug
}

export const buildSEOArticleCategoryUseCase = (params: UseCaseParams): SEOArticleCategoryUseCase => {
  const getSEOArticleCategory = buildGet(params)
  const listSEOArticleCategory = buildList(params)
  const createSEOArticleCategory = buildCreate(params)
  const updateSEOArticleCategory = buildUpdate(params)
  const deleteSEOArticleCategory = buildDelete(params)
  const findBySlug = buildFindBySlug(params)
  return {
    getSEOArticleCategory,
    listSEOArticleCategory,
    createSEOArticleCategory,
    updateSEOArticleCategory,
    deleteSEOArticleCategory,
    findBySlug
  }
}
