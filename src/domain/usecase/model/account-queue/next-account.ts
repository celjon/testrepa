import { IModelAccountQueue } from '@/domain/entity/model-account-queue'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type NextAccount = (params: { queueId: string }) => Promise<IModelAccountQueue>

export const buildNextAccount =
  ({ adapter, service }: UseCaseParams): NextAccount =>
  async ({ queueId }) => {
    const accountQueue = await adapter.modelAccountQueueRepository.get({
      where: {
        id: queueId,
      },
      include: {
        provider: true,
        accounts: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    })

    if (!accountQueue) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_QUEUE_NOT_FOUND',
      })
    }

    const updatedAccountQueue = await service.model.accountBalancer.next({
      accountQueue,
    })

    return updatedAccountQueue
  }
