import { Adapter } from '@/domain/types'
import { buildEmit, Emit } from './emit'
import { buildInit, Init } from './init'
import { buildStream, Stream } from './stream'
import { ChatEventStreamMap } from './types'

type Params = Adapter

export type EventStreamService = {
  init: Init
  emit: Emit
  stream: Stream
}

export const buildEventStreamService = (params: Params): EventStreamService => {
  const eventStreamMap: ChatEventStreamMap = {}

  const stream = buildStream({ eventStreamMap, ...params })
  const emit = buildEmit({ eventStreamMap, ...params })
  const init = buildInit({ emit, ...params })

  return {
    init,
    emit,
    stream
  }
}
