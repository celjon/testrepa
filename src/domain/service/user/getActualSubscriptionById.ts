import { Adapter } from '../../types'
import { ISubscription } from '@/domain/entity/subscription'

export type GetActualSubscriptionById = (userId: string) => Promise<ISubscription | null | never>

export const buildGetActualSubscriptionById = ({ employeeRepository, subscriptionRepository }: Adapter): GetActualSubscriptionById => {
  return async (id) => {
    const employee = await employeeRepository.get({
      where: {
        user_id: id
      },
      include: {
        enterprise: true
      }
    })

    const commonPool = !!employee?.enterprise?.common_pool

    const subscription = await subscriptionRepository.get({
      where: commonPool ? { enterprise_id: employee.enterprise_id } : { user_id: id },
      include: {
        plan: {
          include: {
            models: {
              include: {
                model: true
              },
              where: {
                deleted_at: null
              }
            }
          }
        }
      }
    })

    return subscription
  }
}
