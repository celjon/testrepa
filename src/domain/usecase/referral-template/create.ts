import { UseCaseParams } from '@/domain/usecase/types'
import { Currency, Role } from '@prisma/client'
import { IReferralTemplate } from '@/domain/entity/referral-template'
import { ForbiddenError } from '@/domain/errors'

export type Create = (data: {
  userId: string
  currency: Currency
  planId?: string
  tokens?: number
  minWithdrawAmount: number
  encouragementPercentage: number
  capsEncouragementPercentage: number
  name: string
  locale: string
  isPrivate?: boolean
}) => Promise<IReferralTemplate | never>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({
    userId,
    currency,
    planId,
    tokens,
    minWithdrawAmount,
    encouragementPercentage,
    capsEncouragementPercentage,
    name,
    locale,
    isPrivate = false,
  }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (user?.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const referral = await adapter.referralTemplateRepository.create({
      data: {
        currency,
        plan_id: planId,
        tokens,
        min_withdraw_amount: minWithdrawAmount,
        encouragement_percentage: encouragementPercentage,
        caps_encouragement_percentage: capsEncouragementPercentage,
        name,
        locale,
        private: isPrivate,
      },
    })

    return referral
  }
}
