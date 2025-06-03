import { Client } from 'minio'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'
import { CreateQueueWorker, Queues } from '@/queues/types'
import { RepeatableJobHandler, Scheduler } from './types'
import { scheduleSyncDataJobs } from './sync'
import { scheduleModelJobs } from './model'

type Params = DeliveryParams & {
  minioClient: Client
}

export const startRepeatableJobQueue = (params: Params, { repeatableJob }: Queues, createWorker: CreateQueueWorker) => {
  const handlers: Record<string, RepeatableJobHandler> = {}

  createWorker(repeatableJob.name, async (job) => {
    logger.info({
      location: 'startRepeatableJobQueue',
      message: `Processing job ${job.data.jobId}`
    })
    if (handlers[job.data.jobId]) {
      await handlers[job.data.jobId]()
    } else {
      logger.warn({
        message: `Unknown jobId: ${job.data.jobId}`,
        location: 'startRepeatableJobQueue'
      })
    }
  })

  const schedule: Scheduler = (params, handler) => {
    handlers[params.jobId] = handler
    repeatableJob.add(
      params.jobId,
      {
        jobId: params.jobId
      },
      {
        repeat: {
          pattern: params.cronExpression,
          key: params.jobId
        },
        jobId: params.jobId
      }
    )
  }

  scheduleSyncDataJobs(params, schedule)
  scheduleModelJobs(params, schedule)
}
