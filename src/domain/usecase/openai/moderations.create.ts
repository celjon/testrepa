import { UseCaseParams } from '@/domain/usecase/types'

export type ModerationsCreate = (p: { userId: string; params: unknown }) => Promise<unknown>

export const buildModerationsCreate = ({ adapter, service }: UseCaseParams): ModerationsCreate => {
  return async ({ userId, params }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    await service.subscription.checkBalance({ subscription, estimate: 0 })

    const result = await adapter.openaiGateway.raw.moderations.create(params)

    return result.response
  }
}
