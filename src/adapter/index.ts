import { buildGateway, Gateway } from './gateway'
import { buildRepository, Repository } from './repository'
import { buildQueueManager, QueueManager } from './queue'

import { AdapterParams } from './types'

export type Adapter = Gateway & Repository & { queueManager: QueueManager }

export const buildAdapter = (params: AdapterParams): Adapter => {
  const gateway = buildGateway(params)
  const repository = buildRepository(params)
  const queueManager = buildQueueManager(params)

  return {
    ...gateway,
    ...repository,
    queueManager,
  }
}

export * from './gateway'
export * from './repository'
export * from './queue'
