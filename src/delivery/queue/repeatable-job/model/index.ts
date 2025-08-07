import { DeliveryParams } from '@/delivery/types'
import { Scheduler } from '../types'
import { buildUpdatePopularityScores } from './update-popularity-scores'

type Params = DeliveryParams

export const scheduleModelJobs = (params: Params, schedule: Scheduler) => {
  schedule(
    {
      cronExpression: '0 4 * * *',
      jobId: 'model:updatePopularityScores',
    },
    buildUpdatePopularityScores(params),
  )
}
