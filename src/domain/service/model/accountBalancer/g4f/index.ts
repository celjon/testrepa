import { Adapter } from '@/domain/types'
import { Balance, buildBalance } from './balance'
import { BalanceGeneration, buildBalanceGeneration } from './balanceGeneration'
import { buildGetActiveAccount, GetActiveAccount } from './getActiveAccount'
import { buildCheckG4FAccountQueue, CheckG4FAccountQueue } from './checkG4FAccounts'
import { DecryptAccount } from '../decrypt-account'
import { buildResetAccountModels, ResetAccountModels } from './reset-account-models'

type Params = Adapter & {
  decryptAccount: DecryptAccount
}

export type G4FService = {
  balance: Balance
  balanceGeneration: BalanceGeneration
  getActiveAccount: GetActiveAccount
  checkG4FAccountQueue: CheckG4FAccountQueue
  resetAccountModels: ResetAccountModels
}

export const buildG4FService = (params: Params): G4FService => {
  const balance = buildBalance(params)
  const balanceGeneration = buildBalanceGeneration(params)
  const getActiveAccount = buildGetActiveAccount(params)

  return {
    balance,
    balanceGeneration,
    getActiveAccount,
    checkG4FAccountQueue: buildCheckG4FAccountQueue(params),
    resetAccountModels: buildResetAccountModels(params)
  }
}
