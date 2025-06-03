import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type Parse = () => void

export const buildParse = ({ model }: Params): Parse => {
  return () => {
    model.parse().catch((error) => {
      logger.error({
        location: 'cron.job.model.parse',
        message: getErrorString(error)
      })
    })
  }
}
