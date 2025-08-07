import { Adapter } from '@/domain/types'
import { DecryptAccount } from '../decrypt-account'
import { buildBalance, Balance } from './balance'
import { buildBalanceGeneration, BalanceGeneration } from './balance-generation'
import { buildGetActiveAccount, GetActiveAccount } from './get-active-account'
import { buildCheckAccountQueue, CheckAccountQueue } from './check-account-queue'
import { buildResetAccountModels, ResetAccountModels } from './reset-account-models'
import { buildCheckModelSubstitutions, CheckModelSubstitutions } from './check-model-substitutions'
import { buildUpdateAccountsPhases, UpdateAccountsPhases } from './update-accounts-phases'
import { buildResetAccounts, ResetAccounts } from './reset-accounts'

type Params = Adapter & {
  decryptAccount: DecryptAccount
}

export type G4FService = {
  balance: Balance
  balanceGeneration: BalanceGeneration
  getActiveAccount: GetActiveAccount
  checkAccountQueue: CheckAccountQueue
  checkModelSubstitutions: CheckModelSubstitutions
  resetAccountModels: ResetAccountModels
  resetAccounts: ResetAccounts
  updateAccountsPhases: UpdateAccountsPhases
}

export const buildG4FService = (params: Params): G4FService => {
  return {
    balance: buildBalance(params),
    balanceGeneration: buildBalanceGeneration(params),
    getActiveAccount: buildGetActiveAccount(params),
    checkAccountQueue: buildCheckAccountQueue(params),
    resetAccountModels: buildResetAccountModels(params),
    resetAccounts: buildResetAccounts(params),
    checkModelSubstitutions: buildCheckModelSubstitutions(params),
    updateAccountsPhases: buildUpdateAccountsPhases(params),
  }
}
