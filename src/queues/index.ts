import Redis from 'ioredis'
import { Processor, Queue, Worker, WorkerOptions } from 'bullmq'
import { QueueInitConfig, RepeatableJob, UpdateModelAccountHARFileJob } from './types'

export const initializeQueues = (cfg: QueueInitConfig) => {
  const connection = new Redis({
    port: cfg.redis.port,
    host: cfg.redis.host,
    password: cfg.redis.password,
    maxRetriesPerRequest: null
  })

  return {
    queues: {
      softLimitNotifications: new Queue('soft-limit-notifications', {
        connection
      }),
      repeatableJob: new Queue<RepeatableJob>('repeatable-jobs', {
        connection
      }),
      updateModelAccountHARFiles: new Queue<UpdateModelAccountHARFileJob>('update-model-account-har-files', {
        connection
      })
    },
    createWorker: (queueName: string, processor: Processor, opts?: Omit<WorkerOptions, 'connection'>) =>
      new Worker(queueName, processor, {
        ...opts,
        connection
      })
  }
}
