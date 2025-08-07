import { Client } from 'minio'
import { DeliveryParams } from '../types'
import { buildModelJob } from './jobs/model'
import { IJob } from './types'
import { buildEmployeeJob } from '@/delivery/cron/jobs/employee'

const buildStart = (jobs: Array<IJob>) => {
  return () => {
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      job.start()
    }
  }
}

export interface ICron {
  start: () => void
}

type Params = DeliveryParams & {
  minioClient: Client
}

export const buildCron = (params: Params): ICron => {
  const jobs = [buildModelJob(params), buildEmployeeJob(params)]

  return {
    start: buildStart(jobs),
  }
}
