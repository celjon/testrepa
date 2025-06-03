import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { buildListUsers, ListUsers } from './user/list'
import { buildUpdateUser, UpdateUser } from './user/update'
import { buildPlanAddModel, PlanAddModel } from './plan/addModel'
import { buildPlanRemoveModel, PlanRemoveModel } from './plan/removeModel'
import { buildCreateReferralTemplate, CreateReferralTemplate } from './referralTemplate/create'
import { buildListReferralTemplate, ListReferralTemplate } from './referralTemplate/list'
import { buildDeleteReferralTemplate, DeleteReferralTemplate } from './referralTemplate/delete'
import { buildUpdatePlan, UpdatePlan } from './plan/update'
import { buildModelEnable, ModelEnable } from './model/enable'
import { buildModelDisable, ModelDisable } from './model/disable'
import { buildTransactionList, TransactionList } from './transaction/list'
import { buildModelUpdate, ModelUpdate } from './model/update'
import { buildPlanSetDefaultModel, PlanSetDefaultModel } from './plan/setDefaultModel'
import { buildPlanUnsetDefaultModel, PlanUnsetDefaultModel } from './plan/unsetDefaultModel'
import { buildPlatformTokens, PlatformTokens } from './statistics/platformTokens'
import { buildGetTokensByModel, GetTokensByModel } from './statistics/getTokensByModel'
import { buildAdminRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetProductUsageReport, GetProductUsageReport } from './statistics/get-product-usage-report'

type Params = Pick<DeliveryParams, 'user' | 'plan' | 'referralTemplate' | 'model' | 'transaction' | 'statistics' | 'middlewares'>

export type AdminMethods = {
  user: {
    list: ListUsers
    update: UpdateUser
  }
  plan: {
    addModel: PlanAddModel
    removeModel: PlanRemoveModel
    update: UpdatePlan
    setDefaultModel: PlanSetDefaultModel
    unsetDefaultModel: PlanUnsetDefaultModel
  }
  referralTemplate: {
    create: CreateReferralTemplate
    list: ListReferralTemplate
    delete: DeleteReferralTemplate
  }
  model: {
    enable: ModelEnable
    disable: ModelDisable
    update: ModelUpdate
  }
  transaction: {
    list: TransactionList
  }
  statistics: {
    platformTokens: PlatformTokens
    getTokensByModel: GetTokensByModel
    getProductUsageReport: GetProductUsageReport
  }
}

const buildRegisterRoutes = (methods: AdminMethods, middlewares: Middlewares) => {
  return (root: Express.Router) => {
    const rules = buildAdminRules(middlewares)

    const namespace = Express.Router()
    namespace.get('/user/list', rules.listUsersRules, createRouteHandler(methods.user.list))
    namespace.put('/user/:id', rules.updateUserRules, createRouteHandler(methods.user.update))
    namespace.get('/user/:id/transaction/list', rules.transactionListRules, createRouteHandler(methods.transaction.list))

    namespace.post('/plan/:id/model/add', rules.planModelRules, createRouteHandler(methods.plan.addModel))
    namespace.post('/plan/:id/model/set-default', rules.modelSetDefaultRules, createRouteHandler(methods.plan.setDefaultModel))
    namespace.post('/plan/:id/model/unset-default', rules.unsetDefaultModelRules, createRouteHandler(methods.plan.unsetDefaultModel))
    namespace.patch('/plan/:id', rules.updatePlanRules, createRouteHandler(methods.plan.update))
    namespace.post('/plan/:id/model/remove', rules.planModelRules, createRouteHandler(methods.plan.removeModel))

    namespace.get('/referral-template/list', rules.listReferralTemplateRules, createRouteHandler(methods.referralTemplate.list))
    namespace.post('/referral-template', rules.createReferralTemplateRules, createRouteHandler(methods.referralTemplate.create))
    namespace.delete('/referral-template/:id', rules.deleteReferralTemplateRules, createRouteHandler(methods.referralTemplate.delete))

    namespace.post('/model/enable', rules.modelEnableDisableRules, createRouteHandler(methods.model.enable))
    namespace.post('/model/disable', rules.modelEnableDisableRules, createRouteHandler(methods.model.disable))
    namespace.patch('/model', rules.updateModelRules, createRouteHandler(methods.model.update))

    namespace.get('/statistics/platform-tokens', rules.platformTokensRules, createRouteHandler(methods.statistics.platformTokens))
    namespace.get('/statistics/tokens-by-model', rules.getTokensByModelRules, createRouteHandler(methods.statistics.getTokensByModel))
    namespace.get('/statistics/product-usage', rules.getTokensByModelRules, createRouteHandler(methods.statistics.getProductUsageReport))

    root.use('/admin', namespace)
  }
}

export const buildAdminHandler = (params: Params): IHandler => {
  const user = {
    list: buildListUsers(params),
    update: buildUpdateUser(params)
  }

  const plan = {
    addModel: buildPlanAddModel(params),
    removeModel: buildPlanRemoveModel(params),
    update: buildUpdatePlan(params),
    setDefaultModel: buildPlanSetDefaultModel(params),
    unsetDefaultModel: buildPlanUnsetDefaultModel(params)
  }

  const referralTemplate = {
    create: buildCreateReferralTemplate(params),
    list: buildListReferralTemplate(params),
    delete: buildDeleteReferralTemplate(params)
  }

  const model = {
    enable: buildModelEnable(params),
    disable: buildModelDisable(params),
    update: buildModelUpdate(params)
  }

  const transaction = {
    list: buildTransactionList(params)
  }

  const statistics = {
    platformTokens: buildPlatformTokens(params),
    getTokensByModel: buildGetTokensByModel(params),
    getProductUsageReport: buildGetProductUsageReport(params)
  }

  return {
    registerRoutes: buildRegisterRoutes(
      {
        user,
        plan,
        referralTemplate,
        model,
        transaction,
        statistics
      },
      params.middlewares
    )
  }
}
