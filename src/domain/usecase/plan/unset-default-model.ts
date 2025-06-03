import { Role } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type UnsetDefaultModel = (p: { userId: string; planId: string; modelId: string }) => Promise<void | never>
export const buildUnsetDefaultModel = ({ adapter, service }: UseCaseParams): UnsetDefaultModel => {
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

    await service.plan.unsetDefaultModel({
      type: plan.type,
      modelId
    })
  }
}
