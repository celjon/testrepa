import { IPromptQueueEventStream, IPromptQueueEvent, PromptQueueStreamMap } from './types'
import { devMode } from '@/config'
import { Adapter } from '@/adapter'

export type PromptQueueEmit = (params: {
  queueId: string
  event: IPromptQueueEvent
  type?: 'process' | 'stream'
}) => IPromptQueueEventStream | null

type Params = {
  promptEventStreamMap: PromptQueueStreamMap
} & Pick<Adapter, 'clusterGateway'>

export const buildPromptQueueEmit =
  ({ promptEventStreamMap, clusterGateway }: Params): PromptQueueEmit =>
  ({ queueId, event, type = 'process' }) => {
    if (!queueId) return null

    if (!devMode && type === 'process') {
      clusterGateway.emit('prompt-queue-emit', null, queueId, event)
      return null
    }

    if (!(queueId in promptEventStreamMap)) {
      return null
    }

    const stream = promptEventStreamMap[queueId]
    stream.subject.next(event)
    return stream
  }
