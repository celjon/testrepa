import { DeliveryParams } from '@/delivery/types'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'model'>

export type ResetAccountModels = () => Promise<void>

export const buildResetAccountModels = ({ model }: Params): ResetAccountModels => {
  return () => {
    return model
      .resetAccountModels()
      .then(({ resettedCount }) => {
        logger.info({
          location: 'resetAccountModels',
          message: `Resetted ${resettedCount} account models`
        })
      })
      .catch((error) => {
        logger.error({
          location: 'resetAccountModels',
          message: JSON.stringify(error)
        })
      })
  }
}
