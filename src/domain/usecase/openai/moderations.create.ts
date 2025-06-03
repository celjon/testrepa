import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError } from '@/domain/errors'

export type ModerationsCreate = (p: { userId: string; params: unknown }) => Promise<unknown>

export const buildModerationsCreate = ({ adapter, service }: UseCaseParams): ModerationsCreate => {
  return async ({ userId, params }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || (subscription && subscription.balance <= 0) || !subscription.plan) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS'
      })
    }

    const result = await adapter.openaiGateway.raw.moderations.create(params)

    return result.response
  }
}
