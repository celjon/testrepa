import { UseCaseParams } from '@/domain/usecase/types'
import { Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type AddModel = (p: { userId: string; planId: string; modelId: string }) => Promise<void | never>
export const buildAddModel = ({ adapter, service }: UseCaseParams): AddModel => {
  return async ({ userId, planId, modelId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const plan = await adapter.planRepository.get({
      where: {
        id: planId
      }
    })

    if (!plan) {
      throw new Error()
    }

    await service.plan.addModel({
      type: plan.type,
      modelId
    })
  }
}
