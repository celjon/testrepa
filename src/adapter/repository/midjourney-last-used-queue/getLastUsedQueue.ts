import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetLastUsedQueue = () => Promise<string | null>

export const buildGetLastUsedQueue = ({ redis }: Params): GetLastUsedQueue => {
  return async () => redis.client.main.get('midjourney:last_used_queue_id')
}
