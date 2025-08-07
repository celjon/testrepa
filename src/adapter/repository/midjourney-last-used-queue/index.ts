import { AdapterParams } from '@/adapter/types'
import { buildSetLastUsedQueue, SetLastUsedQueue } from './set-last-used-queue'
import { buildGetLastUsedQueue, GetLastUsedQueue } from './get-last-used-queue'

type Params = Pick<AdapterParams, 'midjourneyBalancer' | 'redis'>

export type MidjourneyLastUsedQueueRepository = {
  set: SetLastUsedQueue
  get: GetLastUsedQueue
}

export const buildMidjourneyLastUsedQueueRepository = (
  params: Params,
): MidjourneyLastUsedQueueRepository => {
  const setLastUsedQueue = buildSetLastUsedQueue(params)
  const getLastUsedQueue = buildGetLastUsedQueue(params)

  return {
    set: setLastUsedQueue,
    get: getLastUsedQueue,
  }
}
