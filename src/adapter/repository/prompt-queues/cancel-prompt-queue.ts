import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'

type Params = Pick<AdapterParams, 'redis'>

const QUEUE_SET_PREFIX = 'promptQueues:'
const CANCEL_CH_PREFIX = 'promptQueueCancel:'

export type CancelPromptQueue = (args: { userId: string; queueId: string }) => Promise<boolean>

export const buildCancelPromptQueue = ({ redis }: Params): CancelPromptQueue => {
  return async ({ userId, queueId }) => {
    const setKey = `${QUEUE_SET_PREFIX}${userId}`
    const isMember = await redis.client.main.sIsMember(setKey, queueId)
    if (!isMember) return false

    redis.client.main
      .publish(`${CANCEL_CH_PREFIX}${queueId}`, 'cancel')
      .catch((err) => logger.error('Publish failed:', err))

    return true
  }
}
