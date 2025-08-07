import { buildSyncHardLimits } from './sync-hard-limits'
import { DeliveryParams } from '@/delivery/types'
import { Scheduler } from '../types'

type Params = Pick<DeliveryParams, 'subscription'>

export const scheduleSubscriptionsJobs = (params: Params, schedule: Scheduler) => {
  schedule(
    {
      cronExpression: ' 0 0 1 * *',
      jobId: 'sync:hardLimits',
    },
    buildSyncHardLimits(params),
  )
}
