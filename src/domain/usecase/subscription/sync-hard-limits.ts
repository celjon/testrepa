import { UseCaseParams } from '@/domain/usecase/types'
import { NotFoundError } from '@/domain/errors'
import { logger } from '@/lib/logger'
import { runWithConcurrencyLimit } from '@/lib'

export type SyncHardLimits = () => void

export const buildSyncHardLimits = ({ adapter, service }: UseCaseParams): SyncHardLimits => {
  return async () => {
    try {
      const subscriptions = await adapter.subscriptionRepository.findMany({
        where: {
          hard_limit: { not: null },
          enterprise_id: { not: null },
          payment_plan: 'CREDIT'
        }
      })

      const admin = await adapter.userRepository.get({ where: { role: 'ADMIN' } })
      if (!admin) {
        throw new NotFoundError({ code: 'ADMIN_NOT_FOUND' })
      }

      const CONCURRENCY = 5
      await runWithConcurrencyLimit(CONCURRENCY, subscriptions, async (sub) => {
        try {
          if (sub.hard_limit && sub.hard_limit > 0 && sub.balance < sub.hard_limit) {
            const amount = Number(BigInt(sub.hard_limit) - sub.balance)
            await service.subscription.replenish({
              subscription: sub,
              amount,
              meta: { source: 'auto_credit_replenish', from_user_id: admin.id }
            })
          }
        } catch (err) {
          logger.log({
            level: 'error',
            message: `Replenish error for subscription ${sub.id}: ${JSON.stringify(err)}`
          })
        }
      })
    } catch (error) {
      logger.log({ level: 'error', message: `syncHardLimits error: ${JSON.stringify(error)}` })
    }
  }
}
