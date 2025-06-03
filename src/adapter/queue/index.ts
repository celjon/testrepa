import { AdapterParams } from '../types'
import { buildPublishSoftLimitNotification, PublishSoftLimitNotification } from './soft-limit-notifications'

type Params = Pick<AdapterParams, 'queues'>

export type QueueManager = {
  publishSoftLimitNotification: PublishSoftLimitNotification
  addUpdateModelAccountHARFileJob: (params: { modelAccountId: string }) => Promise<void>
}

export const buildQueueManager = (params: Params): QueueManager => {
  return {
    publishSoftLimitNotification: buildPublishSoftLimitNotification(params),
    addUpdateModelAccountHARFileJob: async (dto) => {
      await params.queues.updateModelAccountHARFiles.add(
        'update-har-file',
        {
          modelAccountId: dto.modelAccountId,
          jobId: `update-har-file:${dto.modelAccountId}`
        },
        {
          removeOnComplete: true
        }
      )
      return
    }
  }
}
