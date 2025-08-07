import { IModelAccountQueue, modelAccountQueueInclude } from '@/domain/entity/model-account-queue'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetAccountQueues = () => Promise<IModelAccountQueue[]>

export const buildGetAccountQueues =
  ({ adapter }: UseCaseParams): GetAccountQueues =>
  async () => {
    const modelAccountQueues = await adapter.modelAccountQueueRepository.list({
      orderBy: {
        created_at: 'desc',
      },
      include: modelAccountQueueInclude,
    })

    return modelAccountQueues
  }
