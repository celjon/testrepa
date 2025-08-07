import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'

export type ShortcutUseCase = {
  create: Create
  update: Update
  list: List
  delete: Delete
}
export const buildShortcutUseCase = (params: UseCaseParams): ShortcutUseCase => {
  const list = buildList(params)
  const create = buildCreate(params)
  const update = buildUpdate(params)
  const deleteShortcut = buildDelete(params)
  return {
    list,
    create,
    update,
    delete: deleteShortcut,
  }
}
