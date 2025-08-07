import { Role } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type SetDefaultModel = (p: {
  userId: string
  planId: string
  modelId: string
}) => Promise<void | never>
export const buildSetDefaultModel = ({ adapter, service }: UseCaseParams): SetDefaultModel => {
  return async ({ userId, planId, modelId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const plan = await adapter.planRepository.get({
      where: {
        id: planId,
      },
    })

    if (!plan) {
      throw new Error()
    }

    await service.plan.setDefaultModel({
      type: plan.type,
      modelId,
    })
  }
}
