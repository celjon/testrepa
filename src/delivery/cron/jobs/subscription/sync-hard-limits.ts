import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'subscription'>

export type SyncHardLimits = () => void

export const buildSyncHardLimits = ({ subscription }: Params): SyncHardLimits => {
  return () => subscription.syncHardLimits()
}
