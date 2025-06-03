import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { NotFoundError } from '@/domain/errors'

export type AdminUpdate = (data: { tokens: string; plan: string; id: string; userId?: string }) => Promise<IUser | never>

export const buildAdminUpdate = ({ adapter, service }: UseCaseParams): AdminUpdate => {
  return async ({ tokens, plan, id, userId }) => {
    const subscription = await adapter.subscriptionRepository.get({
      where: {
        user_id: id
      },
      include: {
        user: true,
        enterprise: true
      }
    })

    if (!subscription) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND'
      })
    }
    // TODO: use number for tokens
    const tokensNum = parseInt(tokens)
    if (subscription.balance > BigInt(tokensNum)) {
      await service.subscription.writeOffWithLimitNotification({
        amount: Number(subscription.balance - BigInt(tokensNum)),
        subscription,
        meta: {
          userId: subscription.user?.id,
          from_user_id: userId
        }
      })
    } else if (subscription.balance < BigInt(tokensNum)) {
      await service.subscription.replenish({
        amount: Number(BigInt(tokensNum) - subscription.balance),
        subscription,
        meta: {
          from_user_id: userId
        }
      })
    }

    const user = await adapter.userRepository.update({
      where: {
        id
      },
      data: {
        subscription: {
          upsert: {
            create: {
              balance: tokensNum,
              plan_id: plan
            },
            update: {
              balance: tokensNum,
              plan_id: plan
            }
          }
        }
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    return user
  }
}
