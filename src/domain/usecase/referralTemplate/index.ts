import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'

export type ReferralTemplateUseCase = {
  create: Create
  list: List
  delete: Delete
}

export const buildReferralTemplateUseCase = (params: UseCaseParams): ReferralTemplateUseCase => {
  const create = buildCreate(params)
  const list = buildList(params)
  const d = buildDelete(params)

  return {
    create,
    list,
    delete: d
  }
}
