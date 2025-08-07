import { UseCaseParams } from '@/domain/usecase/types'
import { buildBuy, Buy } from './buy'
import { buildList, List } from './list'
import { AddModel, buildAddModel } from './add-model'
import { buildRemoveModel, RemoveModel } from './remove-model'
import { buildUpdate, Update } from './update'
import { buildSetDefaultModel, SetDefaultModel } from './set-default-model'
import { buildUnsetDefaultModel, UnsetDefaultModel } from './unset-default-model'

export type PlanUseCase = {
  buy: Buy
  list: List
  addModel: AddModel
  removeModel: RemoveModel
  update: Update
  setDefaultModel: SetDefaultModel
  unsetDefaultModel: UnsetDefaultModel
}
export const buildPlanUseCase = (params: UseCaseParams): PlanUseCase => {
  const buy = buildBuy(params)
  const list = buildList(params)
  const addModel = buildAddModel(params)
  const removeModel = buildRemoveModel(params)
  const update = buildUpdate(params)
  const setDefaultModel = buildSetDefaultModel(params)
  const unsetDefaultModel = buildUnsetDefaultModel(params)
  return {
    buy,
    list,
    addModel,
    removeModel,
    update,
    setDefaultModel,
    unsetDefaultModel,
  }
}
