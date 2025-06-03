import { Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { Product } from '@/domain/entity/statistics'

export type GetProductUsageReport = (params: {
  userId: string
  dateFrom: string
  dateTo: string
  product: Product
}) => Promise<Buffer<ArrayBufferLike>>

export const buildGetProductUsageReport = ({ adapter }: UseCaseParams): GetProductUsageReport => {
  return async ({ userId, dateFrom, dateTo, product }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    const usage = await adapter.actionRepository.getProductUsage({
      dateTo,
      dateFrom,
      product
    })

    const report = await adapter.excelGateway.createProductUsageReport({
      usage: usage,
      product
    })

    return report
  }
}
