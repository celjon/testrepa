import { UseCaseParams } from '@/domain/usecase/types'
import { IReferralTemplate } from '@/domain/entity/referral-template'
import { Prisma } from '@prisma/client'

export type List = (data: {
  userId?: string
  search?: string
  page?: number
  locale?: string
}) => Promise<
  | {
      data: Array<IReferralTemplate>
      pages: number
    }
  | never
>

export const buildList = ({ service, adapter }: UseCaseParams): List => {
  return async ({ search, page, locale, userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    const where: Prisma.ReferralTemplateFindManyArgs['where'] = {}

    if (!user || user.role !== 'ADMIN') {
      where.private = false
    }

    const referrals = await service.referralTemplate.paginate({
      query: {
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
          locale,
          ...where,
          disabled: false,
        },
        include: {
          plan: true,
        },
      },
      page,
    })

    return referrals
  }
}
