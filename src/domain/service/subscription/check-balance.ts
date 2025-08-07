import { EnterprisePaymentPlanStatus } from '@prisma/client'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'

type CheckBalanceParams = {
  subscription: ISubscription | null
  estimate: number
}
export type CheckBalance = (data: CheckBalanceParams) => Promise<void>
export const buildCheckBalance = (): CheckBalance => {
  return async (data: CheckBalanceParams) => {
    const { subscription, estimate } = data

    if (!subscription || !subscription.plan) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    }

    //SKIP FOR CREDIT ENTERPRISE
    if (
      subscription.enterprise_id &&
      subscription.payment_plan === EnterprisePaymentPlanStatus.CREDIT &&
      subscription.credit_limit
    ) {
      if (
        (subscription.balance >= 0n &&
          subscription.credit_limit + Number(subscription.balance) > estimate) ||
        (subscription.balance < 0n &&
          Math.abs(Number(subscription.balance)) < subscription.credit_limit)
      ) {
        return
      }
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS',
        message: `Исчерпан кредитный лимит вашей организации`,
      })
    }

    if (subscription.balance <= 0) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS',
      })
    }

    if (subscription.balance < estimate) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS',
        message: `Недостаточно CAPS: требуется приблизительно ${estimate}, у вас ${subscription.balance}`,
      })
    }
  }
}
