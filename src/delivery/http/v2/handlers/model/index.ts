import { buildList, List } from './list'
import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { buildListAll, ListAll } from './listAll'
import { buildDisable, Disable } from './disable'
import { buildModelRules } from './rules'
import { buildEnable, Enable } from './enable'
import { Middlewares } from '../../middlewares'
import { buildAdminRules } from '@/delivery/http/v2/handlers/admin/rules'
import { buildUpdate, Update } from './update'
import { buildGetProviders, GetProviders } from './getProviders'
import { buildUpdateProvider, UpdateProvider } from './updateProvider'
import { config } from '@/config'
import { buildGetCustomization, GetCustomization } from './getCustomization'
import { buildCreateCustom, CreateCustom } from './createCustom'
import { buildUpdateCustom, UpdateCustom } from './updateCustom'
import { buildParse, Parse } from './parse'
import { buildDeleteCustom, DeleteCustom } from './deleteCustom'
import { buildCreateAccount, CreateAccount } from './createAccount'
import { buildUpdateAccount, UpdateAccount } from './updateAccount'
import { buildDeleteAccount, DeleteAccount } from './deleteAccount'
import { buildCreateAccountModel, CreateAccountModel } from './createAccountModel'
import { buildUpdateAccountModel, UpdateAccountModel } from './updateAccountModel'
import { buildDeleteAccountModel, DeleteAccountModel } from './deleteAccountModel'
import { buildCreateAccountQueue, CreateAccountQueue } from './createAccountQueue'
import { buildUpdateAccountQueue, UpdateAccountQueue } from './updateAccountQueue'
import { buildDeleteAccountQueue, DeleteAccountQueue } from './deleteAccountQueue'
import { buildGetAccountQueues, GetAccountQueues } from './getAccountQueues'
import { buildNextAccount, NextAccount } from './nextAccount'
import { BalanceAccount, buildBalanceAccount } from './balanceAccount'
import { buildGetModelProviders, GetModelProviders } from './getModelProviders'
import { buildListCompact, ListCompact } from './listCompact'
import { buildCheckAccountQueue, CheckAccountQueue } from './check-account-queue'
import { AutoUpdateAccountHARFile, buildAutoUpdateAccountHARFile } from './auto-update-account-har-file'
import { AutoUpdateAccountQueueHARFiles, buildAutoUpdateAccountQueueHARFiles } from './auto-update-account-queue-har-files'

type Params = Pick<DeliveryParams, 'model' | 'middlewares'>

export type ModelMethods = {
  update: Update
  list: List
  listCompact: ListCompact
  listAll: ListAll
  disable: Disable
  enable: Enable
  getProviders: GetProviders
  getModelProviders: GetModelProviders
  updateProvider: UpdateProvider
  getCustomization: GetCustomization
  createCustom: CreateCustom
  updateCustom: UpdateCustom
  deleteCustom: DeleteCustom
  parse: Parse
  createAccount: CreateAccount
  updateAccount: UpdateAccount
  deleteAccount: DeleteAccount
  autoUpdateAccountHARFile: AutoUpdateAccountHARFile
  autoUpdateAccountQueueHARFiles: AutoUpdateAccountQueueHARFiles
  createAccountModel: CreateAccountModel
  updateAccountModel: UpdateAccountModel
  deleteAccountModel: DeleteAccountModel
  createAccountQueue: CreateAccountQueue
  updateAccountQueue: UpdateAccountQueue
  deleteAccountQueue: DeleteAccountQueue
  getAccountQueues: GetAccountQueues
  balanceAccount: BalanceAccount
  nextAccount: NextAccount
  checkAccountQueue: CheckAccountQueue
}

const buildRegisterRoutes = (methods: ModelMethods, middlewares: Middlewares) => {
  const { updateModelRules } = buildAdminRules(middlewares)
  const { disableModelRules, enableModelRules, listModelsRules } = buildModelRules(middlewares)
  const { allowedIps, authRequired, fileUpload } = middlewares
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /model:
     *   patch:
     *     tags: [Model]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             properties:
     *               modelId:
     *                 type: string
     *               label:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  $ref: '#/components/entities/Model'
     */
    namespace.patch('/', updateModelRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /model/list:
     *   get:
     *     tags: [Model]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: parentId
     *         in: query
     *         type: number
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    type: array
     *                    items:
     *                      $ref: '#/components/entities/Model'
     */
    namespace.get('/list', authRequired({ required: false }), listModelsRules, createRouteHandler(methods.list))

    /**
     * @openapi
     * /model/list/compact:
     *   get:
     *     tags: [Model]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    type: array
     *                    items:
     *                      allOf:
     *                        - type: object
     *                        - properties:
     *                            id:
     *                              type: string
     *                            label:
     *                              type: string
     *                            description:
     *                              type: string
     *                            icon:
     *                              type: string
     *                            features:
     *                              type: array
     *                              items:
     *                                type: string
     *                            functions:
     *                              type: array
     *                              items:
     *                                $ref: '#/components/entities/ModelFunction'
     *                            order:
     *                              type: number
     *                            used_count:
     *                              type: number
     *                            popularity_score:
     *                              type: number
     *                            disabled:
     *                              type: boolean
     *                            disabledWeb:
     *                              type: boolean
     *                            is_allowed:
     *                              type: boolean
     *                            allowed_plan_type:
     *                              type: string
     *                            is_default:
     *                              type: boolean
     *                            children:
     *                              type: array
     *                              items:
     *                                type: object
     *
     */
    namespace.get('/list/compact', authRequired({ required: false }), listModelsRules, createRouteHandler(methods.listCompact))

    namespace.get('/list/all', createRouteHandler(methods.listAll))

    /**
     * @openapi
     * /model/disable:
     *   post:
     *     tags: [Model]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             properties:
     *               modelId:
     *                 type: string
     *               platform:
     *                 type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  $ref: '#/components/entities/Model'
     */
    namespace.post('/disable', disableModelRules, createRouteHandler(methods.disable))

    /**
     * @openapi
     * /model/enable:
     *   post:
     *     tags: [Model]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             properties:
     *               modelId:
     *                 type: string
     *               platform:
     *                 type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  $ref: '#/components/entities/Model'
     */
    namespace.post('/enable', enableModelRules, createRouteHandler(methods.enable))

    namespace.get('/provider/list', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.getProviders))
    namespace.patch('/provider/:id', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.updateProvider))

    namespace.get('/custom/list', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.getCustomization))
    namespace.post(
      '/custom',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      fileUpload().single('icon'),
      createRouteHandler(methods.createCustom)
    )
    namespace.patch(
      '/custom/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      fileUpload().single('icon'),
      createRouteHandler(methods.updateCustom)
    )
    namespace.delete(
      '/custom/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.deleteCustom)
    )

    namespace.post('/parse', allowedIps(config.admin.allowed_ips), authRequired({ adminOnly: true }), createRouteHandler(methods.parse))

    namespace.post(
      '/account',
      allowedIps(config.admin.allowed_ips),
      authRequired(),
      fileUpload({ saveFiles: false, maxSize: Infinity }).single('g4fHarFile'),
      createRouteHandler(methods.createAccount)
    )
    namespace.patch(
      '/account/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      fileUpload({ saveFiles: false, maxSize: Infinity }).single('g4fHarFile'),
      createRouteHandler(methods.updateAccount)
    )
    namespace.delete('/account/:id', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.deleteAccount))
    namespace.post('/account/balance', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.balanceAccount))
    namespace.post('/account/next', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.nextAccount))
    namespace.post(
      '/account/:id/auto-update-har-file',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.autoUpdateAccountHARFile)
    )

    namespace.get('/account-queue/list', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.getAccountQueues))
    namespace.post('/account-queue', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.createAccountQueue))
    namespace.patch(
      '/account-queue/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired(),
      createRouteHandler(methods.updateAccountQueue)
    )
    namespace.post(
      '/account-queue/:id/check',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.checkAccountQueue)
    )
    namespace.post(
      '/account-queue/:id/auto-update-har-files',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.autoUpdateAccountQueueHARFiles)
    )
    namespace.delete(
      '/account-queue/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.deleteAccountQueue)
    )

    namespace.post('/account-model', allowedIps(config.admin.allowed_ips), authRequired(), createRouteHandler(methods.createAccountModel))
    namespace.patch(
      '/account-model/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.updateAccountModel)
    )
    namespace.delete(
      '/account-model/:id',
      allowedIps(config.admin.allowed_ips),
      authRequired({ adminOnly: true }),
      createRouteHandler(methods.deleteAccountModel)
    )
    namespace.get('/providers/:id', authRequired(), createRouteHandler(methods.getModelProviders))

    root.use('/model', namespace)
  }
}

export const buildModelHandler = (params: Params): IHandler => {
  const update = buildUpdate(params)
  const list = buildList(params)
  const listAll = buildListAll(params)
  const disable = buildDisable(params)
  const enable = buildEnable(params)
  const getProviders = buildGetProviders(params)
  const getModelProviders = buildGetModelProviders(params)
  const updateProvider = buildUpdateProvider(params)
  const getCustomization = buildGetCustomization(params)
  const createCustom = buildCreateCustom(params)
  const updateCustom = buildUpdateCustom(params)
  const deleteCustom = buildDeleteCustom(params)
  const parse = buildParse(params)
  const createAccount = buildCreateAccount(params)
  const updateAccount = buildUpdateAccount(params)
  const deleteAccount = buildDeleteAccount(params)
  const createAccountModel = buildCreateAccountModel(params)
  const updateAccountModel = buildUpdateAccountModel(params)
  const deleteAccountModel = buildDeleteAccountModel(params)
  const createAccountQueue = buildCreateAccountQueue(params)
  const updateAccountQueue = buildUpdateAccountQueue(params)
  const deleteAccountQueue = buildDeleteAccountQueue(params)
  const getAccountQueues = buildGetAccountQueues(params)
  const balanceAccount = buildBalanceAccount(params)
  const nextAccount = buildNextAccount(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        update,
        disable,
        enable,
        list,
        listCompact: buildListCompact(params),
        listAll,
        getProviders,
        getModelProviders,
        updateProvider,
        getCustomization,
        createCustom,
        updateCustom,
        deleteCustom,
        parse,
        createAccount,
        updateAccount,
        deleteAccount,
        createAccountModel,
        updateAccountModel,
        deleteAccountModel,
        autoUpdateAccountHARFile: buildAutoUpdateAccountHARFile(params),
        autoUpdateAccountQueueHARFiles: buildAutoUpdateAccountQueueHARFiles(params),
        createAccountQueue,
        updateAccountQueue,
        deleteAccountQueue,
        getAccountQueues,
        balanceAccount,
        nextAccount,
        checkAccountQueue: buildCheckAccountQueue(params)
      },
      params.middlewares
    )
  }
}
