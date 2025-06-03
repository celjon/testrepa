import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type UpdatePopularityScores = () => Promise<void>

export const buildUpdatePopularityScores = ({ model }: Params): UpdatePopularityScores => {
  return async () => {
    try {
      const startedAt = performance.now()

      const { modelsUpdated, bucketsDeleted } = await model.updatePopularityScores()

      logger.info({
        location: 'updatePopularityScores',
        message: `Updated ${modelsUpdated} models, deleted ${bucketsDeleted} model usage buckets. [${(performance.now() - startedAt).toFixed(2)}ms]`
      })
    } catch (error) {
      logger.error({
        location: 'updatePopularityScores',
        message: JSON.stringify(error)
      })
    }
  }
}
