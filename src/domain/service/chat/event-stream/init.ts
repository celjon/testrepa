import { Adapter } from '@/domain/types'
import { Emit } from './emit'
import cluster from 'cluster'

type Params = {
  emit: Emit
} & Pick<Adapter, 'clusterGateway'>

export type Init = () => Promise<void>

export const buildInit =
  ({ clusterGateway, emit }: Params): Init =>
  async () => {
    if (cluster.isPrimary) {
      const workers = clusterGateway.getWorkers()

      clusterGateway.on(
        'chat-emit',
        (chatId, event) => {
          const workers = clusterGateway.getWorkers()

          clusterGateway.emit('chat-emit', workers, chatId, event)
        },
        workers
      )
    }
    if (cluster.isWorker) {
      clusterGateway.on('chat-emit', (chatId, event) => {
        emit({
          type: 'stream',
          chatId,
          event
        })
      })
    }
  }
