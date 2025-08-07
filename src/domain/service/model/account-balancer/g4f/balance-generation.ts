import { nanoid } from 'nanoid'
import { ModelAccountModelStatus, ModelAccountStatus } from '@prisma/client'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { InternalError } from '@/domain/errors'
import { IModelAccount, isInUsageLimit } from '@/domain/entity/model-account'
import { IModelAccountModel } from '@/domain/entity/model-account-model'
import { IModelProvider } from '@/domain/entity/model-provider'

type Params = Adapter

export type ActiveG4FAccount = Omit<IModelAccount, 'g4f_api_url'> & {
  g4f_api_url: string
}

// Get active account and model for generation
export type BalanceGeneration = (params: {
  childProvider: IModelProvider | null
  model_id: string
}) => Promise<{
  account: ActiveG4FAccount
  accountModel: IModelAccountModel
  requestId: string
}>

export const buildBalanceGeneration =
  ({ modelAccountQueueRepository, modelAccountRepository }: Params): BalanceGeneration =>
  async ({ childProvider, model_id }) => {
    const g4fAccountQueue = await modelAccountQueueRepository.get({
      where: {
        disabled: false,
        provider: {
          ...(childProvider && {
            id: childProvider.id,
          }),
        },
        provider_id: !childProvider ? config.model_providers.g4f.id : undefined,
      },
      select: {
        id: true,
        active_account: {
          include: { models: { where: { model_id } } },
        },
      },
    })

    if (!g4fAccountQueue) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free active queue not found',
        data: {
          modelId: model_id,
        },
      })
    }

    const g4fActiveAccount = g4fAccountQueue.active_account

    if (g4fActiveAccount && g4fActiveAccount.next_active_id) {
      modelAccountQueueRepository
        .update({
          where: { id: g4fAccountQueue.id },
          data: {
            active_account_id: g4fActiveAccount.next_active_id,
          },
        })
        .catch((error) => {
          logger.error({
            location: 'g4f.balanceGeneration',
            message: `Cannot set active account: ${getErrorString(error)}`,
          })
        })
    }

    if (
      !g4fActiveAccount ||
      g4fActiveAccount.disabled_at ||
      g4fActiveAccount.status !== ModelAccountStatus.ACTIVE ||
      !g4fActiveAccount.next_active_id ||
      !g4fActiveAccount.g4f_api_url ||
      !isInUsageLimit(g4fActiveAccount)
    ) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free active account not found',
        data: {
          modelId: model_id,
          accountName: g4fActiveAccount?.name,
        },
      })
    }

    const accountModel = g4fActiveAccount.models?.[0] ?? null

    if (
      !accountModel ||
      accountModel.disabled_at ||
      accountModel.status !== ModelAccountModelStatus.ACTIVE
    ) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'no active gpt4free account model',
        data: {
          modelId: model_id,
          accountName: g4fActiveAccount.name,
        },
      })
    }

    const stats = await modelAccountRepository.getG4FAccountStats(g4fActiveAccount.id)

    if (stats.cooldownUntil && stats.cooldownUntil > new Date()) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free account is in cooldown',
        data: {
          accountId: g4fActiveAccount.id,
          accountName: g4fActiveAccount.name,
          modelId: model_id,
          cooldownUntil: stats.cooldownUntil,
        },
      })
    }

    if (
      g4fActiveAccount.mj_concurrency &&
      stats.activeRequestsCount >= g4fActiveAccount.mj_concurrency
    ) {
      throw new InternalError({
        code: 'G4F_NO_ACTIVE_ACCOUNTS',
        message: 'gpt4free account has too many active requests',
        data: {
          accountId: g4fActiveAccount.id,
          accountName: g4fActiveAccount.name,
          modelId: model_id,
          activeRequestsCount: stats.activeRequestsCount,
        },
      })
    }

    const requestId = nanoid()
    modelAccountRepository
      .addG4FAccountRequest({
        accountId: g4fActiveAccount.id,
        requestId,
        ttlSeconds: Math.trunc(config.timeouts.g4f_send / 1000),
      })
      .catch((error) => {
        logger.error({
          location: 'g4f.balanceGeneration',
          message: `Cannot add g4f account request: ${getErrorString(error)}`,
          data: {
            accountId: g4fActiveAccount.id,
            requestId,
          },
        })
      })

    return {
      account: g4fActiveAccount as ActiveG4FAccount,
      accountModel,
      requestId,
    }
  }
