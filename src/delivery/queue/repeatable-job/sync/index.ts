import { Client } from 'minio'
import { DeliveryParams } from '@/delivery/types'
import { Scheduler } from '../types'
import { buildDeleteStaleObjects } from './delete-stale-objects'
// import { buildDeleteDeletedChats } from './delete-deleted-chats'

type Params = DeliveryParams & {
  minioClient: Client
}

export const scheduleSyncDataJobs = (params: Params, schedule: Scheduler) => {
  // chats soft delete is disabled
  // schedule(
  //   {
  //     cronExpression: '0 4 * * *',
  //     jobId: 'sync:deleteStaleObjects'
  //   },
  //   buildDeleteDeletedChats(params)
  // )

  schedule(
    {
      cronExpression: '0 1 * * *',
      jobId: 'sync:deleteDeletedChats'
    },
    buildDeleteStaleObjects(params)
  )
}
