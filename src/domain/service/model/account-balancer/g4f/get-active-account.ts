import { config } from '@/config'
import { IModelAccount } from '@/domain/entity/model-account'
import { IModelProvider } from '@/domain/entity/model-provider'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type GetActiveAccount = (params: {
  childProvider: IModelProvider | null
}) => Promise<IModelAccount | null>

export const buildGetActiveAccount =
  ({ modelAccountQueueRepository }: Params): GetActiveAccount =>
  async ({ childProvider }) => {
    const g4fAccountQueue = await modelAccountQueueRepository.get({
      where: {
        provider: {
          ...(childProvider && {
            id: childProvider.id,
          }),
          ...(!childProvider && {
            parent_id: config.model_providers.g4f.id,
          }),
        },
      },
      select: {
        id: true,
        active_account: true,
      },
    })
    if (!g4fAccountQueue || !g4fAccountQueue.active_account) {
      return null
    }

    const g4fActiveAccount = g4fAccountQueue.active_account

    return g4fActiveAccount
  }
