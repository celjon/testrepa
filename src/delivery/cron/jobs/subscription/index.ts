import { DeliveryParams } from '@/delivery/types'
import { IJob } from '../../types'
import cron from 'node-cron'
import { buildSyncHardLimits, SyncHardLimits } from './sync-hard-limits'

type Params = Pick<DeliveryParams, 'subscription'>

type SubscriptionMethods = {
  syncHardLimits: SyncHardLimits
}

const buildStart = (methods: SubscriptionMethods) => {
  return () => {
    cron.schedule('0 0 1 * *', () => {
      methods.syncHardLimits()
    })
  }
}

export const buildSubscriptionJob = (params: Params): IJob => {
  return {
    start: buildStart({
      syncHardLimits: buildSyncHardLimits(params)
    })
  }
}
