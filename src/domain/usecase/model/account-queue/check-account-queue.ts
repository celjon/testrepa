import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { config } from '@/config'
import { IModelAccount } from '@/domain/entity/modelAccount'

type Params = UseCaseParams

export type CheckAccountQueue = (params: { accountQueueId: string }) => Promise<IModelAccount[]>

export const buildCheckAccountQueue = ({ adapter, service }: Params): CheckAccountQueue => {
  return async ({ accountQueueId }) => {
    const queue = await adapter.modelAccountQueueRepository.get({
      where: {
        id: accountQueueId
      }
    })

    if (!queue) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_QUEUE_NOT_FOUND'
      })
    }

    if (queue.provider_id?.startsWith(config.model_providers.g4f.id)) {
      return service.model.accountBalancer.g4f.checkG4FAccountQueue({ accountQueueId })
    }

    const accounts = await adapter.modelAccountRepository.list({
      where: {
        queue_id: accountQueueId
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        g4f_har_file: true,
        models: {
          orderBy: {
            created_at: 'desc'
          },
          include: {
            model: true
          }
        }
      }
    })

    return Promise.all(
      accounts.map((account) => {
        account.g4f_password = null
        account.g4f_email_password = null

        return account
      })
    )
  }
}
