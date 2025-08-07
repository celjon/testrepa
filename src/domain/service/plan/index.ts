import { Adapter } from '../../types'
import { AddModel, buildAddModel } from './add-model'
import { buildHasAccess, HasAccess } from './has-access'
import { buildHasAccessToAPI, HasAccessToAPI } from './has-access-to-api'
import { buildPaginate, Paginate } from './paginate'
import { buildRemoveModel, RemoveModel } from './remove-model'
import { buildSetDefaultModel, SetDefaultModel } from './set-default-model'
import { buildUnsetDefaultModel, UnsetDefaultModel } from './unset-default-model'
import {
  buildUnsetDefaultModelGlobally,
  UnsetDefaultModelGlobally,
} from './unset-default-model-globally'

export type PlanService = {
  paginate: Paginate
  addModel: AddModel
  removeModel: RemoveModel
  hasAccess: HasAccess
  hasAccessToAPI: HasAccessToAPI
  setDefaultModel: SetDefaultModel
  unsetDefaultModel: UnsetDefaultModel
  unsetDefaultModelGlobally: UnsetDefaultModelGlobally
}
export const buildPlanService = (params: Adapter): PlanService => {
  const paginate = buildPaginate(params)
  const addModel = buildAddModel(params)
  const removeModel = buildRemoveModel(params)
  const hasAccess = buildHasAccess(params)
  const hasAccessToAPI = buildHasAccessToAPI(params)
  const setDefaultModel = buildSetDefaultModel(params)
  const unsetDefaultModel = buildUnsetDefaultModel(params)
  const unsetDefaultModelGlobally = buildUnsetDefaultModelGlobally(params)

  return {
    paginate,
    addModel,
    removeModel,
    hasAccess,
    hasAccessToAPI,
    setDefaultModel,
    unsetDefaultModel,
    unsetDefaultModelGlobally,
  }
}
