import { UseCaseParams } from '@/domain/usecase/types'
import { NotFoundError } from '@/domain/errors'
import { logger } from '@/lib/logger'

export type SyncHardLimits = () => Promise<void>

export const buildSyncHardLimits = ({ adapter, service }: UseCaseParams): SyncHardLimits => {
  return async () => {
    try {
      const subscriptions = await adapter.subscriptionRepository.findMany({
        where: {
          credit_limit: { not: null },
          enterprise_id: { not: null },
          payment_plan: 'CREDIT',
        },
      })
      const admin = await adapter.userRepository.get({ where: { role: 'ADMIN' } })
      if (!admin) {
        throw new NotFoundError({ code: 'ADMIN_NOT_FOUND' })
      }

      for (const sub of subscriptions) {
        try {
          if (sub.balance >= 0) continue
          const amount = Math.abs(Number(sub.balance))

          const alreadyExists = await adapter.transactionRepository.get({
            where: {
              enterprise_id: sub.enterprise_id,
              meta: {
                path: ['source'],
                equals: 'auto_credit_replenish',
              },
              created_at: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          })

          if (alreadyExists) {
            logger.info(`[syncHardLimits] Already replenished: ${sub.id}`)
            continue
          }

          await service.subscription.replenish({
            subscription: sub,
            amount,
            meta: { source: 'auto_credit_replenish', from_user_id: admin.id },
          })
        } catch (err) {
          logger.log({
            level: 'error',
            message: `Replenish error for subscription ${sub.id}: ${JSON.stringify(err)}`,
          })
        }
      }
    } catch (error) {
      logger.log({ level: 'error', message: `syncHardLimits error: ${JSON.stringify(error)}` })
    }
  }
}
