import { Adapter } from '@/domain/types'
import { NotFoundError } from '@/domain/errors'
import { IModelAccount } from '@/domain/entity/modelAccount'
import { config as cfg } from '@/config'
import { ModelAccountStatus } from '@prisma/client'

type Params = Adapter

export type Next = () => Promise<IModelAccount>

export const buildNext = ({ modelAccountQueueRepository, midjourneyLastUsedQueueRepository }: Params): Next => {
  return async () => {
    let queues = await modelAccountQueueRepository.list({
      where: { provider_id: cfg.model_providers.midjourney.id, disabled: false },
      include: { accounts: { where: { disabled_at: null } } },
      orderBy: { created_at: 'desc' }
    })

    queues = queues.filter((queue) => queue.accounts && queue.accounts.length > 0)

    if (queues.length < 1)
      throw new NotFoundError({
        code: 'MIDJOURNEY_QUEUES_NOT_FOUND',
        message: 'Create at least one queue for Midjourney'
      })

    let queueIndex = -1

    if (queues.length === 1) queueIndex = 0
    else {
      const lastUsedQueueId = await midjourneyLastUsedQueueRepository.get()

      if (!lastUsedQueueId) queueIndex = 0
      else queueIndex = (queues.findIndex((queue) => queue.id === lastUsedQueueId) + 1) % queues.length
    }

    await midjourneyLastUsedQueueRepository.set({ queueId: queues[queueIndex].id })
    const account = queues[queueIndex].accounts!.find(
      (account) =>
        !account.disabled_at &&
        account.mj_concurrency !== null &&
        Number(account.mj_active_generations) < account.mj_concurrency &&
        account.status === ModelAccountStatus.FAST
    )!

    if (!account) {
      throw new NotFoundError({
        code: 'MIDJOURNEY_ACTIVE_ACCOUNT_NOT_FOUND',
        message: 'Add or active at least one account for Midjourney '
      })
    }

    return account
  }
}
