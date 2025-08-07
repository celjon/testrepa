import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chatRepository'>

export const buildDeleteDeletedChats =
  ({ chatRepository }: Params) =>
  async () => {
    try {
      const startedAt = performance.now()
      const timeoutInMs = 30 * 60 * 1000

      for (let i = 0; i < 5; i++) {
        const result = await chatRepository.deleteMany({
          where: {
            deleted: true,
          },
          limit: 1000,
        })
        logger.info({
          location: 'deleteDeletedChats',
          message: `Deleted ${result.count} chats.`,
        })

        if (result.count === 0) {
          break
        }

        if (performance.now() > startedAt + timeoutInMs) {
          break
        }
      }
    } catch (err) {
      logger.error({
        location: 'deleteDeletedChats',
        message: `Error deleting deleted chats: ${err}`,
      })
    }
  }
