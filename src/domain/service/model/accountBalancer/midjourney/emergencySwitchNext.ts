import { Adapter } from '@/domain/types'
import { NotFoundError } from '@/domain/errors'
import { ModelAccountStatus } from '@prisma/client'
import { SwitchNext } from './switchNext'

type Params = Adapter & {
  switchNext: SwitchNext
}

export type EmergencySwitchNext = (params: { accountQueueId: string; status: ModelAccountStatus }) => Promise<void>

export const buildEmergencySwitchNext = ({
  switchNext,
  modelAccountRepository,
  modelAccountQueueRepository
}: Params): EmergencySwitchNext => {
  return async ({ accountQueueId, status }) => {
    const queue = await modelAccountQueueRepository.get({
      where: {
        id: accountQueueId
      },
      include: {
        accounts: {
          where: {
            status: ModelAccountStatus.FAST
          }
        }
      }
    })

    if (!queue) {
      throw new NotFoundError({
        code: 'MIDJOURNEY_QUEUE_NOT_FOUND'
      })
    }

    if (!queue.accounts || queue.accounts.length === 0) {
      await modelAccountQueueRepository.update({
        where: {
          id: accountQueueId
        },
        data: {
          disabled: true
        }
      })
    } else if (queue.accounts.length < 2) {
      await Promise.all([
        modelAccountQueueRepository.update({
          where: {
            id: accountQueueId
          },
          data: {
            disabled: true
          }
        }),
        modelAccountRepository.update({
          where: {
            id: queue.accounts[0].id
          },
          data: {
            disabled_at: new Date(),
            status: status,
            mj_active_generations: 0
          }
        })
      ])
    } else {
      await switchNext({ accountQueue: queue, currentAccountId: queue.accounts[0].id, currentStatus: status })
    }
  }
}
