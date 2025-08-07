import { UseCaseParams } from '../types'
import { buildCreateKey, CreateKey } from './create-key'
import { buildDeleteKey, DeleteKey } from './delete-key'
import { buildDeleteManyKeys, DeleteManyKeys } from './delete-many-keys'
import { buildGetKeys, GetKeys } from './get-keys'
import { buildUpdateKey, UpdateKey } from './update-key'

export type DeveloperUseCase = {
  createKey: CreateKey
  getKeys: GetKeys
  deleteKey: DeleteKey
  deleteManyKeys: DeleteManyKeys
  updateKey: UpdateKey
}

export const buildDeveloperUseCase = (params: UseCaseParams): DeveloperUseCase => {
  const createKey = buildCreateKey(params)
  const getKeys = buildGetKeys(params)
  const updateKey = buildUpdateKey(params)
  const deleteKey = buildDeleteKey(params)
  const deleteManyKeys = buildDeleteManyKeys(params)

  return {
    createKey,
    getKeys,
    updateKey,
    deleteKey,
    deleteManyKeys,
  }
}
