import { Adapter } from '@/adapter'
import { buildAccrueReferralCapsEncouragement } from './accrue-referral-caps-encouragement'
import { buildReplenish, Replenish } from './replenish'
import { buildWriteOff, buildWriteOffWithLimitNotification, WriteOff } from './write-off'
import { buildCheckBalance, CheckBalance } from './check-balance'

export type SubscriptionService = {
  replenish: Replenish
  writeOff: WriteOff
  writeOffWithLimitNotification: WriteOff
  checkBalance: CheckBalance
}
export const buildSubscriptionService = (params: Adapter): SubscriptionService => {
  const replenish = buildReplenish(params)
  const accrueReferralCapsEncouragement = buildAccrueReferralCapsEncouragement(params)
  const checkBalance = buildCheckBalance()
  const writeOff = buildWriteOff({
    ...params,
    accrueReferralCapsEncouragement,
  })

  const writeOffWithLimitNotification = buildWriteOffWithLimitNotification({
    ...params,
    writeOff,
  })

  return {
    replenish,
    writeOff,
    writeOffWithLimitNotification,
    checkBalance,
  }
}
