import { UseCaseParams } from '@/domain/usecase/types'
import { PlanType } from '@prisma/client'
import { IPlan } from '@/domain/entity/plan'

export type Manage = () => Promise<void>

export const buildManage = ({ adapter }: UseCaseParams): Manage => {
  return async () => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const subscriptionsToRenew = await adapter.subscriptionRepository.list({
      where: {
        created_at: {
          lt: monthAgo,
        },
      },
      include: {
        plan: true,
        user: true,
      },
    })
    if (!subscriptionsToRenew) {
      return
    }
    const freePlan = (await adapter.planRepository.get({
      where: {
        type: PlanType.FREE,
      },
    })) as IPlan
    for (let i = 0; i < subscriptionsToRenew.length; i++) {
      const subscription = subscriptionsToRenew[i]
      await adapter.subscriptionRepository.update({
        where: {
          id: subscription.id,
        },
        data: {
          plan_id: freePlan.id,
          balance: freePlan.tokens,
          created_at: new Date(),
        },
      })
    }
  }
}
