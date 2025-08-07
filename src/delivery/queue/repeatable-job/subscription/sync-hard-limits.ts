import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'subscription'>

export type SyncHardLimits = () => Promise<void>

export const buildSyncHardLimits = ({ subscription }: Params): SyncHardLimits => {
  return async () => await subscription.syncHardLimits()
}
