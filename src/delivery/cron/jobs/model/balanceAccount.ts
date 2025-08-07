import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type BalanceAccount = () => void

export const buildBalanceAccount = ({ model }: Params): BalanceAccount => {
  return () => {
    return model.balanceAccount().catch((error) => {
      logger.error({
        location: 'cron.job.model.balanceAccount',
        message: getErrorString(error),
      })
    })
  }
}
