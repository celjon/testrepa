import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildList, List } from './list'
import { buildDelete, Delete } from './delete'
import { buildUpdate, Update } from './update'
import { buildDeleteCategory, DeleteCategory } from './delete-category'
import { buildCreateCategory, CreateCategory } from './create-category'
import { buildUpdateCategory, UpdateCategory } from './update-category'
import { buildGetCategories, GetCategories } from './get-categories'
import { buildFavorite, Favorite } from './favorite'
import { buildUnfavorite, Unfavorite } from './unfavorite'
import { buildGetFilters, GetFilters } from './get-filters'
import { buildCreateChat, CreateChat } from './create-chat'

export type PresetUseCase = {
  create: Create
  update: Update
  delete: Delete
  list: List
  getCategories: GetCategories
  createCategory: CreateCategory
  updateCategory: UpdateCategory
  deleteCategory: DeleteCategory
  favorite: Favorite
  unfavorite: Unfavorite
  getFilters: GetFilters
  createChat: CreateChat
}

export const buildPresetUseCase = (params: UseCaseParams): PresetUseCase => {
  const create = buildCreate(params)
  const update = buildUpdate(params)
  const deletePreset = buildDelete(params)
  const list = buildList(params)
  const getCategories = buildGetCategories(params)
  const createCategory = buildCreateCategory(params)
  const updateCategory = buildUpdateCategory(params)
  const deleteCategory = buildDeleteCategory(params)
  const favorite = buildFavorite(params)
  const unfavorite = buildUnfavorite(params)
  const getFilters = buildGetFilters(params)
  const createChat = buildCreateChat(params)

  return {
    create,
    update,
    delete: deletePreset,
    list,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    favorite,
    unfavorite,
    getFilters,
    createChat
  }
}
