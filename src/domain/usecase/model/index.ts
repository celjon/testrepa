import { UseCaseParams } from '@/domain/usecase/types'
import { buildList, List } from '@/domain/usecase/model/list'
import { buildParse, Parse } from './parse'
import { buildEnable, Enable } from './enable'
import { buildDisable, Disable } from './disable'
import { buildListAll, ListAll } from './list-all'
import { buildUpdate, Update } from './update'
import { buildGetProviders, GetProviders } from './get-providers'
import { buildUpdateProvider, UpdateProvider } from './update-provider'
import { buildCreateCustom, CreateCustom } from './create-custom'
import { buildGetCustomization, GetCustomization } from './get-customization'
import { buildUpdateCustom, UpdateCustom } from './update-custom'
import { buildDeleteCustom, DeleteCustom } from './delete-custom'
import { buildCreateAccount, CreateAccount } from './account-queue/create-account'
import { buildCreateAccountModel, CreateAccountModel } from './account-queue/create-account-model'
import { buildCreateAccountQueue, CreateAccountQueue } from './account-queue/create-account-queue'
import { buildUpdateAccount, UpdateAccount } from './account-queue/update-account'
import { buildDeleteAccount, DeleteAccount } from './account-queue/delete-account'
import { buildUpdateAccountModel, UpdateAccountModel } from './account-queue/update-account-model'
import { buildDeleteAccountModel, DeleteAccountModel } from './account-queue/delete-account-model'
import { buildUpdateAccountQueue, UpdateAccountQueue } from './account-queue/update-account-queue'
import { buildDeleteAccountQueue, DeleteAccountQueue } from './account-queue/delete-account-queue'
import { buildGetAccountQueues, GetAccountQueues } from './account-queue/get-account-queues'
import { buildNextAccount, NextAccount } from './account-queue/next-account'
import { BalanceAccount, buildBalanceAccount } from './account-queue/balance-account'
import { buildInit, Init } from './init'
import { buildGetModelProviders, GetModelProviders } from './get-model-providers'
import { buildListCompact, ListCompact } from './list-compact'
import { buildCheckAccountQueue, CheckAccountQueue } from './account-queue/check-account-queue'
import {
  AutoUpdateAccountHARFile,
  buildAutoUpdateAccountHARFile,
} from './account-queue/auto-update-account-har-file'
import {
  AutoUpdateAccountQueueHARFiles,
  buildAutoUpdateAccountQueueHARFiles,
} from './account-queue/auto-update-account-queue-har-files'
import { UpdatePopularityScores, buildUpdatePopularityScores } from './update-popularity-scores'
import { UpdateAccountsPhases } from '@/domain/service/model/account-balancer/g4f/update-accounts-phases'
import { ResetAccountModels } from '@/domain/service/model/account-balancer/g4f/reset-account-models'
import { CheckModelSubstitutions } from '@/domain/service/model/account-balancer/g4f/check-model-substitutions'
import { ResetAccounts } from '@/domain/service/model/account-balancer/g4f/reset-accounts'

export type ModelUseCase = {
  init: Init
  list: List
  listCompact: ListCompact
  parse: Parse
  enable: Enable
  disable: Disable
  listAll: ListAll
  update: Update
  getProviders: GetProviders
  updateProvider: UpdateProvider
  createCustom: CreateCustom
  updateCustom: UpdateCustom
  getCustomization: GetCustomization
  deleteCustom: DeleteCustom
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
  getModelProviders: GetModelProviders
  checkAccountQueue: CheckAccountQueue
  checkG4FModelSubstitutions: CheckModelSubstitutions
  resetAccountModels: ResetAccountModels
  resetAccounts: ResetAccounts
  updatePopularityScores: UpdatePopularityScores
  updateG4FAccountsPhases: UpdateAccountsPhases
}

export const buildModelUseCase = (params: UseCaseParams): ModelUseCase => {
  const init = buildInit(params)
  const list = buildList(params)
  const listCompact = buildListCompact(params)
  const parse = buildParse(params)
  const enable = buildEnable(params)
  const disable = buildDisable(params)
  const listAll = buildListAll(params)
  const update = buildUpdate(params)
  const getProviders = buildGetProviders(params)
  const updateProvider = buildUpdateProvider(params)
  const createCustom = buildCreateCustom(params)
  const updateCustom = buildUpdateCustom(params)
  const getCustomization = buildGetCustomization(params)
  const deleteCustom = buildDeleteCustom(params)
  const createAccount = buildCreateAccount(params)
  const updateAccount = buildUpdateAccount(params)
  const deleteAccount = buildDeleteAccount(params)
  const autoUpdateAccountHARFile = buildAutoUpdateAccountHARFile(params)
  const autoUpdateAccountQueueHARFiles = buildAutoUpdateAccountQueueHARFiles(params)
  const createAccountModel = buildCreateAccountModel(params)
  const updateAccountModel = buildUpdateAccountModel(params)
  const deleteAccountModel = buildDeleteAccountModel(params)
  const createAccountQueue = buildCreateAccountQueue(params)
  const updateAccountQueue = buildUpdateAccountQueue(params)
  const deleteAccountQueue = buildDeleteAccountQueue(params)
  const getAccountQueues = buildGetAccountQueues(params)
  const balanceAccount = buildBalanceAccount(params)
  const nextAccount = buildNextAccount(params)
  const getModelProviders = buildGetModelProviders(params)

  return {
    init,
    list,
    listCompact,
    parse,
    enable,
    disable,
    listAll,
    update,
    getProviders,
    updateProvider,
    createCustom,
    updateCustom,
    getCustomization,
    deleteCustom,
    createAccount,
    updateAccount,
    deleteAccount,
    autoUpdateAccountHARFile,
    autoUpdateAccountQueueHARFiles,
    createAccountModel,
    updateAccountModel,
    deleteAccountModel,
    createAccountQueue,
    updateAccountQueue,
    deleteAccountQueue,
    getAccountQueues,
    balanceAccount,
    nextAccount,
    getModelProviders,
    checkAccountQueue: buildCheckAccountQueue(params),
    checkG4FModelSubstitutions: params.service.model.accountBalancer.g4f.checkModelSubstitutions,
    resetAccountModels: params.service.model.accountBalancer.g4f.resetAccountModels,
    resetAccounts: params.service.model.accountBalancer.g4f.resetAccounts,
    updatePopularityScores: buildUpdatePopularityScores(params),
    updateG4FAccountsPhases: params.service.model.accountBalancer.g4f.updateAccountsPhases,
  }
}
