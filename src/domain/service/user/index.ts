import { Adapter } from '../../types'
import { buildExists, Exists } from './exists'
import { buildGetActualSubscription, GetActualSubscription } from './getActualSubscription'
import { buildGetActualSubscriptionById, GetActualSubscriptionById } from './getActualSubscriptionById'
import { buildHasEnterpriseActualSubscription, HasEnterpriseActualSubscription } from './hasEnterpriseActualSubscription'
import { buildInitialize, Initialize } from './initialize'
import { buildMergeAccounts, MergeAccounts } from './merge-accounts'
import { buildPaginate, Paginate } from './paginate'
import { buildSetDisable, SetDisable } from './setDisable'
import { buildToExcel, ToExcel } from './toExcel'
import { ChatService } from '../chat'
import { buildUnlinkAccount, UnlinkAccount } from './unlinkAccount'

type Params = Adapter & {
  chatService: ChatService
}

export type UserService = {
  exists: Exists
  getActualSubscription: GetActualSubscription
  getActualSubscriptionById: GetActualSubscriptionById
  hasEnterpriseActualSubscription: HasEnterpriseActualSubscription
  initialize: Initialize
  mergeAccounts: MergeAccounts
  paginate: Paginate
  setDisable: SetDisable
  toExcel: ToExcel
  unlinkAccount: UnlinkAccount
}
export const buildUserService = (params: Params): UserService => {
  const exists = buildExists(params)
  const getActualSubscription = buildGetActualSubscription(params)
  const getActualSubscriptionById = buildGetActualSubscriptionById(params)
  const hasEnterpriseActualSubscription = buildHasEnterpriseActualSubscription()
  const initialize = buildInitialize(params)
  const mergeAccounts = buildMergeAccounts(params)
  const paginate = buildPaginate(params)
  const setDisable = buildSetDisable(params)
  const toExcel = buildToExcel(params)
  const unlinkAccount = buildUnlinkAccount(params)

  return {
    exists,
    getActualSubscription,
    getActualSubscriptionById,
    hasEnterpriseActualSubscription,
    initialize,
    mergeAccounts,
    paginate,
    setDisable,
    toExcel,
    unlinkAccount
  }
}
