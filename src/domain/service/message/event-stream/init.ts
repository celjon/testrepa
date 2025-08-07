import { Adapter } from '@/domain/types'
import cluster from 'cluster'
import { PromptQueueEmit } from './prompt-queue-emit'

type Params = {
  promptQueueEmit: PromptQueueEmit
} & Pick<Adapter, 'clusterGateway'>

export type Init = () => Promise<void>

export const buildInit =
  ({ clusterGateway, promptQueueEmit }: Params): Init =>
  async () => {
    if (cluster.isPrimary) {
      const workers = clusterGateway.getWorkers()

      clusterGateway.on(
        'prompt-queue-emit',
        (queueId, event) => {
          const workers = clusterGateway.getWorkers()
          clusterGateway.emit('prompt-queue-emit', workers, queueId, event)
        },
        workers,
      )
    }
    if (cluster.isWorker) {
      clusterGateway.on('prompt-queue-emit', (queueId, event) => {
        promptQueueEmit({ type: 'stream', queueId, event })
      })
    }
  }
