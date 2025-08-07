import { DeliveryParams } from '@/delivery/types'
import { Scheduler } from '../types'
import { buildCheckModelSubstitutions } from './check-model-substitution'
import { buildUpdateAccountsPhases } from './update-accounts-phases'
import { buildAutoUpdateHARFiles } from './auto-update-har-files'
import { buildResetAccountModels } from './reset-account-models'
import { buildResetAccounts } from './reset-accounts'

type Params = DeliveryParams

export const scheduleG4FJobs = (params: Params, schedule: Scheduler) => {
  schedule(
    {
      cronExpression: '*/15 * * * *',
      jobId: 'g4f:resetAccountModels',
    },
    buildResetAccountModels(params),
  )

  schedule(
    {
      cronExpression: '4,19,34,49 * * * *',
      jobId: 'g4f:resetAccounts',
    },
    buildResetAccounts(params),
  )

  schedule(
    {
      cronExpression: '5 * * * *',
      jobId: 'g4f:checkModelSubstitutions',
    },
    buildCheckModelSubstitutions(params),
  )
  schedule(
    {
      cronExpression: '2,17,32,47 * * * *',
      jobId: 'g4f:updateAccountsPhases',
    },
    buildUpdateAccountsPhases(params),
  )
  schedule(
    {
      cronExpression: '0 3 * * *',
      jobId: 'g4f:autoUpdateHARFiles',
    },
    buildAutoUpdateHARFiles(params),
  )
}
