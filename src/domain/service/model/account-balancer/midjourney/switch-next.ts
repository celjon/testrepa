import { IModelAccountQueue } from '@/domain/entity/model-account-queue'
import { Adapter } from '@/domain/types'
import { IModelAccount } from '@/domain/entity/model-account'
import { ModelAccountStatus } from '@prisma/client'
import { InvalidDataError } from '@/domain/errors'

type Params = Adapter

export type SwitchNext = (params: {
  accountQueue: IModelAccountQueue
  currentAccountId?: string
  currentStatus?: ModelAccountStatus
  recalculateTimeOnly?: boolean
}) => Promise<IModelAccount | null>

export const buildSwitchNext = ({
  modelAccountRepository,
  modelAccountQueueRepository,
}: Params): SwitchNext => {
  const generateNextSwitchTime = (accountCount: number): Date => {
    const baseIntervalMs = (24 * 60 * 60 * 1000) / accountCount
    const randomOffset = baseIntervalMs * 0.1 * (Math.random() * 2 - 1)
    const intervalMs = Math.max(baseIntervalMs + randomOffset, 30 * 60 * 1000)
    return new Date(Date.now() + intervalMs)
  }

  const updateQueueSwitchTime = async (queueId: string, accountCount: number) => {
    const next_switch_time = generateNextSwitchTime(accountCount)
    await modelAccountQueueRepository.update({
      where: { id: queueId },
      data: { next_switch_time },
    })

    return next_switch_time
  }

  const handleSingleAccount = async (account: IModelAccount) => {
    return await modelAccountRepository.update({
      where: { id: account.id },
      data: {
        disabled_at: account.status !== ModelAccountStatus.FAST ? new Date() : null,
        mj_active_generations: 0,
      },
    })
  }

  const handleMultipleAccounts = async (
    accounts: IModelAccount[],
    currentStatus?: ModelAccountStatus,
  ): Promise<IModelAccount> => {
    const activeIndex = accounts.findIndex((account) => !account.disabled_at)
    if (activeIndex === -1) {
      throw new InvalidDataError({ code: 'NO_ACTIVE_ACCOUNT' })
    }

    const accountCount = accounts.length
    let nextAccountId: string | undefined

    const allowedStatuses: ModelAccountStatus[] = [
      ModelAccountStatus.FAST,
      ModelAccountStatus.CREATED,
    ]

    for (let i = activeIndex; i < accountCount + activeIndex; i++) {
      const candidate = accounts[(i + 1) % accountCount]
      if (allowedStatuses.includes(candidate.status)) {
        nextAccountId = candidate.id
        break
      }
    }

    if (!nextAccountId) {
      throw new InvalidDataError({ code: 'NO_VALID_NEXT_ACCOUNT' })
    }

    const [_, nextAccount] = await Promise.all([
      modelAccountRepository.update({
        where: { id: accounts[activeIndex].id },
        data: {
          disabled_at: new Date(),
          status: currentStatus,
          mj_active_generations: 0,
        },
      }),
      modelAccountRepository.update({
        where: { id: nextAccountId },
        data: {
          disabled_at: null,
          status: ModelAccountStatus.FAST,
          mj_active_generations: 0,
        },
      }),
    ])

    return nextAccount
  }

  return async ({ accountQueue, currentStatus, recalculateTimeOnly = false }) => {
    if (!accountQueue.accounts) {
      accountQueue =
        (await modelAccountQueueRepository.get({
          where: { id: accountQueue.id },
          include: {
            accounts: { orderBy: { created_at: 'asc' } },
          },
        })) ?? accountQueue
    }

    const { accounts, id: queueId } = accountQueue
    if (!accounts || accounts.length === 0) return null

    const accountCount = accounts.length

    if (recalculateTimeOnly || !accountQueue.next_switch_time) {
      await updateQueueSwitchTime(queueId, accountCount)
      return null
    }

    const nextAccount =
      accountCount === 1
        ? await handleSingleAccount(accounts[0])
        : await handleMultipleAccounts(accounts, currentStatus)

    const next_switch_time = generateNextSwitchTime(accountCount)

    await modelAccountQueueRepository.update({
      where: { id: queueId },
      data: { next_switch_time },
    })

    return nextAccount
  }
}
