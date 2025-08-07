import { IDeveloperKey } from '@/domain/entity/developer-key'
import { PlanType } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type CreateKey = (data: { userId: string; label?: string }) => Promise<IDeveloperKey> | never

export const buildCreateKey = ({ service }: UseCaseParams): CreateKey => {
  return async ({ userId, label }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    if (subscription?.plan?.type === PlanType.FREE) {
      throw new ForbiddenError()
    }

    const developerKey = await service.developerKey.create({
      userId,
      label,
    })

    return developerKey
  }
}
