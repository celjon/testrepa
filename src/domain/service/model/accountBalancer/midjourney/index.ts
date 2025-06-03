import { Adapter } from '@/domain/types'
import { Balance, buildBalance } from './balance'
import { buildSwitchNext, SwitchNext } from './switchNext'
import { buildNext, Next } from './next'
import { buildInit, Init } from './init'
import { buildEmergencySwitchNext, EmergencySwitchNext } from './emergencySwitchNext'
import { buildFindAvailableAccount, FindAvailableAccount } from './findAvailableAccount'

type Params = Adapter

export type MidjourneyService = {
  init: Init
  balance: Balance
  next: Next
  switchNext: SwitchNext
  emergencySwitchNext: EmergencySwitchNext
  findAvailableAccount: FindAvailableAccount
}

export const buildMidjourneyService = (params: Params): MidjourneyService => {
  const init = buildInit(params)
  const switchNext = buildSwitchNext(params)
  const emergencySwitchNext = buildEmergencySwitchNext({ ...params, switchNext })
  const next = buildNext(params)
  const balance = buildBalance({
    switchNext,
    ...params
  })
  const findAvailableAccount = buildFindAvailableAccount({
    ...params,
    next
  })

  return {
    init,
    balance,
    next,
    switchNext,
    emergencySwitchNext,
    findAvailableAccount
  }
}
