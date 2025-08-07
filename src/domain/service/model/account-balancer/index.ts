import { Adapter } from '@/domain/types'
import { Balance, buildBalance } from './balance'
import { buildG4FService, G4FService } from './g4f'
import { buildMidjourneyService, MidjourneyService } from './midjourney'
import { buildNext, Next } from './next'
import { buildDecryptAccount, DecryptAccount } from './decrypt-account'

type Params = Adapter

export type AccountBalancerService = {
  balance: Balance
  next: Next
  g4f: G4FService
  midjourney: MidjourneyService
  decryptAccount: DecryptAccount
}

export const buildAccountBalancerService = (params: Params): AccountBalancerService => {
  const decryptAccount = buildDecryptAccount(params)

  const g4f = buildG4FService({
    ...params,
    decryptAccount,
  })
  const midjourney = buildMidjourneyService(params)
  const balance = buildBalance({
    ...params,
    g4f,
    midjourney,
  })
  const next = buildNext({
    ...params,
    midjourney,
  })

  return {
    balance,
    next,
    g4f,
    midjourney,
    decryptAccount,
  }
}
