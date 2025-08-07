import { Adapter } from '@/domain/types'
import { buildInit, Init } from './init'
import { PromptQueueStreamMap } from './types'
import { buildPromptQueueEmit, PromptQueueEmit } from './prompt-queue-emit'
import { buildPromptQueueStream, PromptQueueStream } from './prompt-queue-stream'

type Params = Adapter

export type EventStreamService = {
  init: Init
  promptQueueEmit: PromptQueueEmit
  promptQueueStream: PromptQueueStream
}

export const buildEventStreamService = (params: Params): EventStreamService => {
  const promptEventStreamMap: PromptQueueStreamMap = {}

  const promptQueueStream = buildPromptQueueStream({ promptEventStreamMap, ...params })
  const promptQueueEmit = buildPromptQueueEmit({ promptEventStreamMap, ...params })
  const init = buildInit({ promptQueueEmit, ...params })

  return {
    init,
    promptQueueEmit,
    promptQueueStream,
  }
}
