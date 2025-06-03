import { config } from '@/config'
import { IModelAccount } from '@/domain/entity/modelAccount'
import { IModelAccountModel } from '@/domain/entity/modelAccountModel'
import { IModelProvider } from '@/domain/entity/modelProvider'
import { InternalError } from '@/domain/errors'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type BalanceGeneration = (params: { childProvider: IModelProvider | null; model_id: string }) => Promise<{
  g4fActiveAccount: IModelAccount
  g4fAccountModel: IModelAccountModel | null
} | null>

export const buildBalanceGeneration =
  ({ modelAccountQueueRepository }: Params): BalanceGeneration =>
  async ({ childProvider, model_id }) => {
    const g4fAccountQueue = await modelAccountQueueRepository.get({
      where: {
        provider: {
          ...(childProvider && {
            id: childProvider.id
          }),
          ...(!childProvider && {
            parent_id: config.model_providers.g4f.id
          })
        }
      },
      select: {
        id: true,
        active_account: {
          include: {
            models: {
              where: {
                model_id
              }
            }
          }
        }
      }
    })

    if (!g4fAccountQueue || g4fAccountQueue.disabled) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free active queue not found'
      })
    }

    if (!g4fAccountQueue.active_account || g4fAccountQueue.active_account.disabled_at || !g4fAccountQueue.active_account.next_active_id) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free active account not found'
      })
    }

    const g4fActiveAccount = g4fAccountQueue.active_account
    const g4fAccountModel = g4fActiveAccount.models?.[0] ?? null

    await modelAccountQueueRepository.update({
      where: { id: g4fAccountQueue.id },
      data: {
        active_account_id: g4fActiveAccount.next_active_id
      }
    })

    if (!g4fAccountModel || g4fAccountModel.disabled_at) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'no active gpt4free account model'
      })
    }

    return { g4fActiveAccount, g4fAccountModel }
  }
