import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

const QUEUE_SET_PREFIX = 'promptQueues:'
export type RemovePromptQueue = (args: { userId: string; queueId: string }) => Promise<void>

export const buildRemovePromptQueue = ({ redis }: Params): RemovePromptQueue => {
  return async ({ userId, queueId }) => {
    const setKey = `${QUEUE_SET_PREFIX}${userId}`

    await redis.client.main.sRem(setKey, queueId)

    delete redis.client.cancelFns[queueId]
  }
}
