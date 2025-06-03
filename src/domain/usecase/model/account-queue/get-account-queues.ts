import { IModelAccountQueue, modelAccountQueueInclude } from '@/domain/entity/modelAccountQueue'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetAccountQueues = () => Promise<IModelAccountQueue[]>

export const buildGetAccountQueues =
  ({ adapter }: UseCaseParams): GetAccountQueues =>
  async () => {
    const modelAccountQueues = await adapter.modelAccountQueueRepository.list({
      orderBy: {
        created_at: 'desc'
      },
      include: modelAccountQueueInclude
    })

    return modelAccountQueues.map((queue) => ({
      ...queue,
      accounts: (queue.accounts ?? []).map((account) => {
        account.g4f_password = null
        account.g4f_email_password = null

        return account
      })
    }))
  }
