import { Adapter } from '../../types'
import { buildAccrueReferralCapsEncouragement } from './accrue-referral-caps-encouragement'
import { buildReplenish, Replenish } from './replenish'
import { buildWriteOff, buildWriteOffWithLimitNotification, WriteOff } from './write-off'

export type SubscriptionService = {
  replenish: Replenish
  writeOff: WriteOff
  writeOffWithLimitNotification: WriteOff
}
export const buildSubscriptionService = (params: Adapter): SubscriptionService => {
  const replenish = buildReplenish(params)
  const accrueReferralCapsEncouragement = buildAccrueReferralCapsEncouragement(params)

  const writeOff = buildWriteOff({
    ...params,
    accrueReferralCapsEncouragement
  })

  const writeOffWithLimitNotification = buildWriteOffWithLimitNotification({
    ...params,
    writeOff
  })

  return {
    replenish,
    writeOff,
    writeOffWithLimitNotification
  }
}
