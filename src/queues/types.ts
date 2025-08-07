import { Processor, Queue, Worker, WorkerOptions } from 'bullmq'
import { SoftLimitNotificationJobDto } from '@/domain/dto'

export type QueueInitConfig = {
  redis: {
    host: string
    port: number
    user: string
    password: string
  }
}

export type RepeatableJob = {
  jobId: string
}

export type UpdateModelAccountHARFileJob = {
  jobId: string
  modelAccountId: string
}

export type Queues = {
  softLimitNotifications: Queue<SoftLimitNotificationJobDto>
  repeatableJob: Queue<RepeatableJob>
  updateModelAccountHARFiles: Queue<UpdateModelAccountHARFileJob>
}

export type CreateQueueWorker = (
  queueName: string,
  processor: Processor,
  opts?: Omit<WorkerOptions, 'connection'>,
) => Worker
