import { UseCaseParams } from '@/domain/usecase/types'
import { Role } from '@prisma/client'
import { IReferralTemplate } from '@/domain/entity/referralTemplate'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Delete = (data: { userId: string; id: string }) => Promise<IReferralTemplate | never>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ userId, id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const referral = await adapter.referralTemplateRepository.update({
      where: {
        id
      },
      data: {
        disabled: true
      }
    })

    if (!referral) {
      throw new NotFoundError()
    }

    return referral
  }
}
