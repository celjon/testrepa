import { Adapter } from '../../types'
import { AddModel, buildAddModel } from './addModel'
import { buildHasAccess, HasAccess } from './hasAccess'
import { buildHasAccessToAPI, HasAccessToAPI } from './hasAccessToAPI'
import { buildPaginate, Paginate } from './paginate'
import { buildRemoveModel, RemoveModel } from './removeModel'
import { buildSetDefaultModel, SetDefaultModel } from './setDefaultModel'
import { buildUnsetDefaultModel, UnsetDefaultModel } from './unsetDefaultModel'
import { buildUnsetDefaultModelGlobally, UnsetDefaultModelGlobally } from './unsetDefaultModelGlobally'

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
    unsetDefaultModelGlobally
  }
}
