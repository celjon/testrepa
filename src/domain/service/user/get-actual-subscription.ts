import { IUser } from '@/domain/entity/user'
import { Adapter } from '../../types'
import { ISubscription } from '@/domain/entity/subscription'

export type GetActualSubscription = (user: IUser) => Promise<ISubscription | null | never>

export const buildGetActualSubscription = ({
  subscriptionRepository,
}: Adapter): GetActualSubscription => {
  return async (user) => {
    const employee = user.employees?.[0]

    const commonPool = !!employee?.enterprise?.common_pool

    const subscription = await subscriptionRepository.get({
      where: commonPool ? { enterprise_id: employee.enterprise_id } : { user_id: user.id },
      include: {
        plan: true,
      },
    })

    return subscription
  }
}
