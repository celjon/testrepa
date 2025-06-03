import { AdapterParams } from '@/adapter/types'
import { buildSetLastUsedQueue, SetLastUsedQueue } from './setLastUsedQueue'
import { buildGetLastUsedQueue, GetLastUsedQueue } from './getLastUsedQueue'

type Params = Pick<AdapterParams, 'midjourneyBalancer' | 'redis'>

export type MidjourneyLastUsedQueueRepository = {
  set: SetLastUsedQueue
  get: GetLastUsedQueue
}

export const buildMidjourneyLastUsedQueueRepository = (params: Params): MidjourneyLastUsedQueueRepository => {
  const setLastUsedQueue = buildSetLastUsedQueue(params)
  const getLastUsedQueue = buildGetLastUsedQueue(params)

  return {
    set: setLastUsedQueue,
    get: getLastUsedQueue
  }
}
