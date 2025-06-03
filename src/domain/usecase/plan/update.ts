import { UseCaseParams } from '@/domain/usecase/types'
import { Role } from '@prisma/client'
import { IPlan } from '@/domain/entity/plan'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Update = (p: { userId: string; planId: string; price?: number; tokens?: number }) => Promise<IPlan | never>
export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ userId, planId, price, tokens }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const plan = await adapter.planRepository.update({
      where: {
        id: planId
      },
      data: {
        price,
        tokens
      }
    })

    if (!plan) {
      throw new NotFoundError()
    }

    return plan
  }
}
