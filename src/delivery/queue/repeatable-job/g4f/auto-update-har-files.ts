import { config } from '@/config'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model' | 'modelAccountQueueRepository'>

export type AutoUpdateHARFiles = () => Promise<void>

export const buildAutoUpdateHARFiles = ({
  model,
  modelAccountQueueRepository,
}: Params): AutoUpdateHARFiles => {
  return async () => {
    const accountQueue = await modelAccountQueueRepository.get({
      where: {
        provider: {
          parent_id: config.model_providers.g4f.id,
        },
      },
    })

    if (!accountQueue) {
      return
    }
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)

    // Preventively auto update HAR files
    await model.autoUpdateAccountQueueHARFiles({
      accountQueueId: accountQueue.id,
      withHARFileUpdatedBefore: eightDaysAgo,
    })
  }
}
