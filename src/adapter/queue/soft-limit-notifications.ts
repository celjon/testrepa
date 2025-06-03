import { SoftLimitNotificationJobDto } from '@/domain/dto'
import { AdapterParams } from '../types'

type Params = Pick<AdapterParams, 'queues'>

export type PublishSoftLimitNotification = (dto: SoftLimitNotificationJobDto) => Promise<void>

export const buildPublishSoftLimitNotification = (params: Params): PublishSoftLimitNotification => {
  return async (dto) => {
    await params.queues.softLimitNotifications.add('send-notification', dto, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true
    })
    return
  }
}
