import { Adapter, EnterpriseRepository } from '@/domain/types'
import { IEnterprise } from '@/domain/entity/enterprise'

export type Paginate = (data: {
  query: Parameters<EnterpriseRepository['list']>[0]
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<IEnterprise>
      pages: number
    }
  | never
>

export const buildPaginate = ({ enterpriseRepository }: Adapter): Paginate => {
  return async ({ query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await enterpriseRepository.list({
      ...query,
      ...(page && { skip: (page - 1) * quantity }),
      ...(page && { take: quantity }),
    })

    const pages = page
      ? Math.ceil(
          (await enterpriseRepository.count({
            where: query?.where,
          })) / quantity,
        )
      : 1

    return {
      data,
      pages,
    }
  }
}
