import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { IPromptQueueEventStream } from '@/domain/entity/prompt-queue-event'

export type PromptQueueStream = (params: {
  queueId: string
  userId: string
}) => Promise<IPromptQueueEventStream>

export const buildPromptQueueStream =
  ({ adapter, service }: UseCaseParams): PromptQueueStream =>
  async ({ queueId, userId }) => {
    const queue = await adapter.promptQueuesRepository.getQueue({ userId, queueId })

    if (!queue) {
      throw new NotFoundError({
        code: 'QUEUE_NOT_FOUND',
      })
    }

    const queueEventStream: IPromptQueueEventStream =
      await service.message.eventStream.promptQueueStream({ queueId })

    return queueEventStream
  }
