import { UseCaseParams } from '@/domain/usecase/types'
import { buildDelete, Delete } from './delete'
import { buildCreate, Create } from './create'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildMove, Move } from './move'

export type GroupUseCase = {
  create: Create
  delete: Delete
  deleteMany: DeleteMany
  list: List
  update: Update
  move: Move
}

export const buildGroupUseCase = (params: UseCaseParams): GroupUseCase => {
  const create = buildCreate(params)
  const del = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const move = buildMove(params)

  return {
    create,
    delete: del,
    deleteMany,
    list,
    update,
    move
  }
}
