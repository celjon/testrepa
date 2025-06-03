import { ModelAccountStatus } from '@prisma/client'
import { config, devMode } from '@/config'
import { parseTimeMs } from '@/lib'
import { logger } from '@/lib/logger'
import { IModelAccount, isActiveModelAccount } from '@/domain/entity/modelAccount'
import { IModelAccountModel } from '@/domain/entity/modelAccountModel'
import { InternalError } from '@/domain/errors'
import { Adapter } from '@/domain/types'
import { TgBotParseMode } from '@/lib/clients/tg-bot'

type Params = Adapter

export type Balance = (params: {
  g4fAccount: IModelAccount | null
  g4fAccountModel: IModelAccountModel | null
  generationStart: number
  error?: unknown
}) => Promise<void>

export const buildBalance =
  ({
    modelAccountQueueRepository,
    modelAccountRepository,
    modelAccountModelRepository,
    tgNotificationBotGateway,
    queueManager
  }: Params): Balance =>
  async ({ g4fAccount, g4fAccountModel, generationStart, error = null }) => {
    const updateG4FAccount = async () => {
      try {
        if (!g4fAccount) {
          return
        }

        if (
          error instanceof InternalError &&
          (error.code === 'G4F_PAYMENT_REQUIRED' ||
            error.code === 'G4F_FORBIDDEN' ||
            error.code === 'G4F_NO_VALID_HAR_FILE' ||
            error.code === 'G4F_NO_VALID_ACCESS_TOKEN')
        ) {
          await modelAccountRepository.update({
            where: {
              id: g4fAccount.id
            },
            data: {
              disabled_at: new Date(),
              status: ModelAccountStatus.INACTIVE
            }
          })

          if (error.code === 'G4F_NO_VALID_HAR_FILE' || error.code === 'G4F_NO_VALID_ACCESS_TOKEN') {
            queueManager.addUpdateModelAccountHARFileJob({ modelAccountId: g4fAccount.id })
          }

          logger.info('g4f.balance: disabling account: ', {
            name: g4fAccount.name
          })
          if (!devMode) {
            tgNotificationBotGateway.send(
              `Отключение G4F аккаунта ${g4fAccount.name}: \n${JSON.stringify({
                error: error,
                g4fAccountModel: g4fAccountModel?.model_id
              })}`,
              TgBotParseMode.HTML
            )
          }
        }

        if (!g4fAccountModel) {
          return
        }

        const timeLimitMs = parseTimeMs(g4fAccountModel.time_limit ?? '')
        const usageTimeMs = g4fAccountModel.usage_time.getTime()
        const generationTimeMs = performance.now() - generationStart

        let disabled_at = null
        let reason = ''

        if (g4fAccountModel.limit > 0 && g4fAccountModel.usage_count + 1 >= g4fAccountModel.limit) {
          disabled_at = new Date()
          reason += `USAGE_COUNT_EXCEEDED ${g4fAccountModel.usage_count + 1}/${g4fAccountModel.limit} `
        }

        if (timeLimitMs > 0 && usageTimeMs + generationTimeMs >= timeLimitMs) {
          disabled_at = new Date()
          reason += `USAGE_TIME_EXCEEDED ${usageTimeMs + generationTimeMs}/${timeLimitMs} ms`
        }
        if (error instanceof InternalError && error.code === 'G4F_MODEL_USAGE_COUNT_EXCEEDED') {
          disabled_at = new Date()
          reason += `G4F_MODEL_USAGE_COUNT_EXCEEDED`
        }

        if (!g4fAccountModel.disabled_at && disabled_at) {
          logger.info(`g4f.balance: disabling model: ${g4fAccount.name}/${g4fAccountModel.model_id}. Reason: ${reason}`)
        }

        if (!g4fAccountModel.disabled_at && disabled_at && !devMode) {
          tgNotificationBotGateway.send(
            `Отключение модели ${g4fAccount.name}/${g4fAccountModel.model_id}. Причина: ${reason}`,
            TgBotParseMode.HTML
          )
        }

        await Promise.all([
          modelAccountModelRepository.update({
            where: { id: g4fAccountModel.id },
            data: {
              usage_count: { increment: 1 },
              usage_time: new Date(usageTimeMs + generationTimeMs),
              disabled_at
            }
          })
        ])
      } catch (error) {
        logger.error('Failed to update G4F account model', error)
      }
    }
    await updateG4FAccount()

    const g4fAccountQueues = await modelAccountQueueRepository.list({
      where: {
        provider: {
          parent_id: config.model_providers.g4f.id
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        accounts: {
          orderBy: {
            created_at: 'desc'
          },
          include: {
            models: {
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        }
      }
    })

    await Promise.all(
      g4fAccountQueues.map((g4fAccountQueue, index) => {
        const g4fAccounts = g4fAccountQueue.accounts ?? null

        let g4fFirstAccount: IModelAccount | null
        if (g4fAccounts && g4fAccounts.length > 0) {
          g4fFirstAccount = g4fAccounts[0]
        } else {
          g4fFirstAccount = null
        }
        const g4fFirstAccountId: string | null = g4fFirstAccount ? g4fFirstAccount.id : null

        if (index > 0 || g4fAccountQueue.disabled) {
          return modelAccountQueueRepository.update({
            where: {
              id: g4fAccountQueue.id
            },
            data: {
              first_account_id: g4fFirstAccountId,
              active_account_id: null,
              accounts: {
                updateMany: {
                  where: {},
                  data: {
                    status: ModelAccountStatus.INACTIVE,
                    next_active_id: null
                  }
                }
              }
            }
          })
        }
        if (!g4fAccounts) {
          return null
        }

        return Promise.all([
          modelAccountQueueRepository.update({
            where: { id: g4fAccountQueue.id },
            data: {
              first_account_id: g4fFirstAccountId,
              ...(!g4fAccountQueue.active_account_id && {
                active_account_id: g4fFirstAccountId
              })
            }
          }),
          ...g4fAccounts.map((g4fAccount, g4fAccountIndex) => {
            const status = isActiveModelAccount(g4fAccount) ? ModelAccountStatus.ACTIVE : ModelAccountStatus.INACTIVE

            const g4fNextAccount: IModelAccount | null =
              g4fAccounts.find(
                (g4fNextAccount, g4fNextAccountIndex) => g4fAccountIndex + 1 <= g4fNextAccountIndex && isActiveModelAccount(g4fNextAccount)
              ) ??
              g4fAccounts.find((g4fNextAccount) => isActiveModelAccount(g4fNextAccount)) ??
              null
            const g4fNextAccountId: string | null = g4fNextAccount ? g4fNextAccount.id : null

            return modelAccountRepository.update({
              where: { id: g4fAccount.id },
              data: {
                status,
                next_active_id: g4fNextAccountId
              }
            })
          })
        ])
      })
    )
  }
