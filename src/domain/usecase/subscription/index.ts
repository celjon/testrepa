import { buildManage, Manage } from './manage'
import { UseCaseParams } from '@/domain/usecase/types'
import { buildSyncHardLimits, SyncHardLimits } from './sync-hard-limits'

export type SubscriptionUseCase = {
  manage: Manage
  syncHardLimits: SyncHardLimits
}
export const buildSubscriptionUseCase = (params: UseCaseParams): SubscriptionUseCase => {
  const manage = buildManage(params)
  const syncHardLimits = buildSyncHardLimits(params)
  return {
    manage,
    syncHardLimits,
  }
}
