import { IModelAccountQueue, modelAccountQueueInclude } from '@/domain/entity/modelAccountQueue'
import { Adapter } from '@/domain/types'
import { MidjourneyService } from './midjourney'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { isMidjourneyProvider } from '@/domain/entity/modelProvider'

type Params = Adapter & {
  midjourney: MidjourneyService
}

export type Next = (params: { accountQueue: IModelAccountQueue }) => Promise<IModelAccountQueue>

export const buildNext =
  ({ midjourney, modelAccountQueueRepository }: Params): Next =>
  async ({ accountQueue }) => {
    if (!accountQueue.provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND'
      })
    }

    const { provider } = accountQueue

    if (isMidjourneyProvider(provider)) {
      await midjourney.switchNext({ accountQueue })
    } else {
      throw new ForbiddenError({
        code: 'MODEL_PROVIDER_NOT_SUPPORTED'
      })
    }

    const updatedAccountQueue = await modelAccountQueueRepository.get({
      where: {
        id: accountQueue.id
      },
      include: modelAccountQueueInclude
    })

    if (!updatedAccountQueue) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_QUEUE_NOT_FOUND'
      })
    }

    return updatedAccountQueue
  }
