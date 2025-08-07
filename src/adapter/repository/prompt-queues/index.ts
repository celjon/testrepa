import { AdapterParams } from '@/adapter/types'

import { buildCancelPromptQueue, CancelPromptQueue } from './cancel-prompt-queue'
import { buildCreatePromptQueue, CreatePromptQueue } from './create-prompt-queue'
import { buildRemovePromptQueue, RemovePromptQueue } from './remove-prompt-queue'
import { buildGetQueue, GetQueue } from './get-queue'

type Params = Pick<AdapterParams, 'db' | 'redis'>

export type PromptQueuesRepository = {
  getQueue: GetQueue
  createPromptQueue: CreatePromptQueue
  removePromptQueue: RemovePromptQueue
  cancelPromptQueue: CancelPromptQueue
}

export const buildPromptQueuesRepository = (params: Params): PromptQueuesRepository => {
  const getQueue = buildGetQueue(params)
  const createPromptQueue = buildCreatePromptQueue(params)
  const removePromptQueue = buildRemovePromptQueue(params)
  const cancelPromptQueue = buildCancelPromptQueue(params)
  return {
    getQueue,
    createPromptQueue,
    removePromptQueue,
    cancelPromptQueue,
  }
}
