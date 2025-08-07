import { DeliveryParams } from '@/delivery/types'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'model'>

export type ResetAccounts = () => Promise<void>

export const buildResetAccounts = ({ model }: Params): ResetAccounts => {
  return () => {
    return model
      .resetAccounts()
      .then(({ resettedCount }) => {
        logger.info({
          location: 'resetAccounts',
          message: `Resetted ${resettedCount} accounts`,
        })
      })
      .catch((error) => {
        logger.error({
          location: 'resetAccounts',
          message: JSON.stringify(error),
        })
      })
  }
}
