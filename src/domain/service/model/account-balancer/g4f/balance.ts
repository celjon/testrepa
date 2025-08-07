import { ModelAccountModelStatus, ModelAccountStatus } from '@prisma/client'
import { config, devMode } from '@/config'
import { getErrorString, parseTimeMs } from '@/lib'
import { logger } from '@/lib/logger'
import { IModelAccount, isActiveModelAccount } from '@/domain/entity/model-account'
import { IModelAccountModel } from '@/domain/entity/model-account-model'
import { BaseError } from '@/domain/errors'
import { Adapter } from '@/domain/types'
import { TgBotParseMode } from '@/lib/clients/tg-bot'

type Params = Adapter

// Balance after generation
export type Balance = (params: {
  requestId: string | null
  account: IModelAccount | null
  accountModel: IModelAccountModel | null
  generationStart: number
  error?: unknown
}) => Promise<void>

export const buildBalance =
  ({
    modelAccountQueueRepository,
    modelAccountRepository,
    modelAccountModelRepository,
    tgNotificationBotGateway,
    queueManager,
  }: Params): Balance =>
  async ({ requestId, account, accountModel, generationStart, error = null }) => {
    const updateG4FAccount = async () => {
      try {
        if (!account) {
          return
        }

        // errors that happens before making request to g4f
        const internalErrors = ['G4F_REQUEST_TOO_LONG']
        const requestWasMade =
          !(error instanceof BaseError) || !internalErrors.includes(error.code ?? '')

        if (requestId) {
          await modelAccountRepository.deleteG4FAccountRequest({
            accountId: account.id,
            requestId,
            cooldownUntil: requestWasMade
              ? new Date(Date.now() + config.timeouts.g4f_timeout_between_requests)
              : new Date(0) /* reset cooldown */,
          })
        }

        let accountStatus = undefined

        if (
          error instanceof BaseError &&
          (error.code === 'G4F_PAYMENT_REQUIRED' ||
            error.code === 'G4F_FORBIDDEN' ||
            error.code === 'G4F_NO_VALID_HAR_FILE' ||
            error.code === 'G4F_NO_VALID_ACCESS_TOKEN')
        ) {
          accountStatus = ModelAccountStatus.INACTIVE
          logger.info({
            location: 'g4f.balance',
            message: `set account ${account.name} inactive`,
          })

          if (
            error.code === 'G4F_NO_VALID_HAR_FILE' ||
            error.code === 'G4F_NO_VALID_ACCESS_TOKEN'
          ) {
            queueManager.addUpdateModelAccountHARFileJob({ modelAccountId: account.id })
          }

          if (!devMode) {
            const isAuthError =
              error instanceof BaseError &&
              ['G4F_NO_VALID_ACCESS_TOKEN', 'G4F_NO_VALID_HAR_FILE'].includes(error.code ?? '')

            tgNotificationBotGateway.send(
              `G4F аккаунт ${account.name} неактивен: \n${JSON.stringify({
                error: isAuthError ? getErrorString(error).slice(200) : getErrorString(error),
                g4fAccountModel: accountModel?.model_id,
              })}`,
              TgBotParseMode.HTML,
            )
          }
        }

        if (accountStatus !== undefined || requestWasMade) {
          await modelAccountRepository.update({
            where: { id: account.id },
            data: {
              usage_count: { increment: 1 },
              status: accountStatus,
            },
          })
        }

        if (!accountModel || !requestWasMade) {
          return
        }

        const timeLimitMs = parseTimeMs(accountModel.time_limit ?? '')
        const usageTimeMs = accountModel.usage_time.getTime()
        const generationTimeMs = performance.now() - generationStart

        let status: ModelAccountModelStatus | undefined = undefined
        let reason = ''
        let statusReason = undefined

        if (accountModel.limit > 0 && accountModel.usage_count + 1 >= accountModel.limit) {
          status = ModelAccountModelStatus.INACTIVE
          reason += `USAGE_COUNT_EXCEEDED ${accountModel.usage_count + 1}/${accountModel.limit} `
          statusReason = 'USAGE_COUNT_EXCEEDED'
        }

        if (timeLimitMs > 0 && usageTimeMs + generationTimeMs >= timeLimitMs) {
          status = ModelAccountModelStatus.INACTIVE
          reason += `USAGE_TIME_EXCEEDED ${usageTimeMs + generationTimeMs}/${timeLimitMs} ms`
          statusReason = 'USAGE_TIME_EXCEEDED'
        }
        if (error instanceof BaseError && error.code === 'G4F_MODEL_USAGE_COUNT_EXCEEDED') {
          status = ModelAccountModelStatus.INACTIVE
          reason += `G4F_MODEL_USAGE_COUNT_EXCEEDED`
          statusReason = 'G4F_MODEL_USAGE_COUNT_EXCEEDED'
        }
        if (error instanceof BaseError && error.code === 'G4F_RATE_LIMIT_EXCEEDED') {
          status = ModelAccountModelStatus.INACTIVE
          reason += `G4F_RATE_LIMIT_EXCEEDED`
          statusReason = 'G4F_MODEL_USAGE_COUNT_EXCEEDED'
        }

        if (
          accountModel.status !== ModelAccountModelStatus.INACTIVE &&
          status === ModelAccountModelStatus.INACTIVE
        ) {
          logger.info({
            location: 'g4f.balance',
            message: `disabling model: ${account.name}/${accountModel.model_id}. Reason: ${reason}`,
          })
          if (!devMode) {
            tgNotificationBotGateway.send(
              `Модель ${account.name}/${accountModel.model_id} неактивна. Причина: ${reason}`,
              TgBotParseMode.HTML,
            )
          }
        }

        await modelAccountModelRepository.update({
          where: { id: accountModel.id },
          data: {
            usage_count: { increment: 1 },
            usage_time: new Date(usageTimeMs + generationTimeMs),
            status,
            status_reason: statusReason,
          },
        })
      } catch (error) {
        logger.error({
          location: 'g4f.balance',
          message: `Failed to update G4F account model: ${getErrorString(error)}`,
        })
      }
    }
    await updateG4FAccount()

    const queues = await modelAccountQueueRepository.list({
      where: {
        provider: { parent_id: config.model_providers.g4f.id },
      },
      orderBy: { created_at: 'desc' },
      include: {
        accounts: {
          where: {
            status: { not: ModelAccountStatus.OFFLINE },
            disabled_at: null,
          },
          orderBy: [{ name: 'asc' }, { created_at: 'desc' }],
          include: {
            models: { orderBy: { created_at: 'desc' } },
          },
        },
      },
    })

    await Promise.all(
      queues.map((queue, index) => {
        const accounts = queue.accounts ?? null

        let firstAccount: IModelAccount | null
        if (accounts && accounts.length > 0) {
          firstAccount = accounts[0]
        } else {
          firstAccount = null
        }
        const firstAccountId = firstAccount ? firstAccount.id : null

        if (index > 0 || queue.disabled) {
          return modelAccountQueueRepository.update({
            where: {
              id: queue.id,
            },
            data: {
              first_account_id: firstAccountId,
              active_account_id: null,
              accounts: {
                updateMany: {
                  where: {},
                  data: {
                    status: ModelAccountStatus.INACTIVE,
                    next_active_id: null,
                  },
                },
              },
            },
          })
        }

        if (!accounts) {
          return null
        }

        // check if g4fAccountQueue.active_account_id is set correctly
        const isActiveAccountSet = !!accounts.find((account) => {
          return account.id === queue.active_account_id && isActiveModelAccount(account)
        })

        return Promise.all([
          modelAccountQueueRepository.update({
            where: { id: queue.id },
            data: {
              first_account_id: firstAccountId,
              ...((!queue.active_account_id || !isActiveAccountSet) && {
                active_account_id: firstAccountId,
              }),
            },
          }),
          ...accounts.map((account, accountIndex) => {
            const nextAccount: IModelAccount | null =
              accounts.find(
                (g4fNextAccount, nextAccountIndex) =>
                  accountIndex + 1 <= nextAccountIndex && isActiveModelAccount(g4fNextAccount),
              ) ??
              accounts.find((g4fNextAccount) => isActiveModelAccount(g4fNextAccount)) ??
              null
            const nextAccountId = nextAccount ? nextAccount.id : null

            return modelAccountRepository.update({
              where: { id: account.id },
              data: { next_active_id: nextAccountId },
            })
          }),
        ])
      }),
    )
  }
