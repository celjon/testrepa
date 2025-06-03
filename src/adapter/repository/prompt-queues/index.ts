import { AdapterParams } from '@/adapter/types'

import { buildCancelPromptQueue, CancelPromptQueue } from './cancel-prompt-queues'
import { buildCreatePromptQueue, CreatePromptQueue } from './create-prompt-queues'
import { buildRemovePromptQueue, RemovePromptQueue } from './remove-prompt-queues'

type Params = Pick<AdapterParams, 'db' | 'redis'>

export type PromptQueuesRepository = {
  createPromptQueue: CreatePromptQueue
  removePromptQueue: RemovePromptQueue
  cancelPromptQueue: CancelPromptQueue
}

export const buildPromptQueuesRepository = (params: Params): PromptQueuesRepository => {
  const createPromptQueue = buildCreatePromptQueue(params)
  const removePromptQueue = buildRemovePromptQueue(params)
  const cancelPromptQueue = buildCancelPromptQueue(params)
  return {
    createPromptQueue,
    removePromptQueue,
    cancelPromptQueue
  }
}
