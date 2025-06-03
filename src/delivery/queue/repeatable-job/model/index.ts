import { DeliveryParams } from '@/delivery/types'
import { Scheduler } from '../types'
import { buildUpdatePopularityScores } from './update-popularity-scores'
import { buildResetAccountModels } from './reset-account-models'

type Params = DeliveryParams

export const scheduleModelJobs = (params: Params, schedule: Scheduler) => {
  schedule(
    {
      cronExpression: '0 4 * * *',
      jobId: 'model:updatePopularityScores'
    },
    buildUpdatePopularityScores(params)
  )

  schedule(
    {
      cronExpression: '0 * * * *',
      jobId: 'model:resetAccountModels'
    },
    buildResetAccountModels(params)
  )
}
