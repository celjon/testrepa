import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type SetLastUsedQueue = (params: { queueId: string }) => Promise<void>

export const buildSetLastUsedQueue = ({ redis }: Params): SetLastUsedQueue => {
  return async ({ queueId }) => {
    await redis.client.main.set('midjourney:last_used_queue_id', queueId)
  }
}
