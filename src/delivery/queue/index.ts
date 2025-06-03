import { Client } from 'minio'
import { CreateQueueWorker, Queues } from '@/queues/types'
import { DeliveryParams } from '../types'
import { startRepeatableJobQueue } from './repeatable-job'
import { startSoftLimitNotificationsQueue } from './soft-limit-notifications'
import { startUpdateModelAccountHARFilesQueue } from './update-model-account-har-files'

type Params = DeliveryParams & {
  minioClient: Client
}

export const start = (params: Params, queues: Queues, createWorker: CreateQueueWorker) => {
  startSoftLimitNotificationsQueue(params, queues, createWorker)
  startRepeatableJobQueue(params, queues, createWorker)
  startUpdateModelAccountHARFilesQueue(params, queues, createWorker)
}
