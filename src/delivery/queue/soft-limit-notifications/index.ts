import { CreateQueueWorker, Queues } from '@/queues/types'
import { DeliveryParams } from '../../types'

type Params = DeliveryParams

export const startSoftLimitNotificationsQueue = (
  params: Params,
  queues: Queues,
  createWorker: CreateQueueWorker,
) => {
  createWorker(queues.softLimitNotifications.name, async (job) => {
    const { subscriptionId, to } = job.data

    const lastNotified =
      await params.subscriptionRepository.getLastSoftLimitNotificationDate(subscriptionId)

    if (!lastNotified) {
      await params.mailGateway.sendSoftLimitMail({
        to: to,
      })

      const now = new Date()

      await params.subscriptionRepository.setLastSoftLimitNotificationDate(
        subscriptionId,
        now,
        12 * 60 * 60,
      )
    }
  })
}
