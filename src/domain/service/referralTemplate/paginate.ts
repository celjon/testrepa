import { Adapter, ReferralTemplateRepository } from '@/domain/types'
import { IReferralTemplate } from '@/domain/entity/referralTemplate'

export type Paginate = (data: { query: Parameters<ReferralTemplateRepository['list']>[0]; page?: number; quantity?: number }) => Promise<
  | {
      data: Array<IReferralTemplate>
      pages: number
    }
  | never
>

export const buildPaginate = ({ referralTemplateRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0
      }
    }

    const data = await referralTemplateRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity })
    })

    const pages = page
      ? Math.ceil(
          (await referralTemplateRepository.count({
            where: query?.where
          })) / quantity
        )
      : 1

    return {
      data,
      pages
    }
  }
}
