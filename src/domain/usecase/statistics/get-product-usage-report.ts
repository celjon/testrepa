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
      where: { id: userId },
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    if (product === Product.GPT4FREE) {
      const usage = await adapter.actionRepository.getG4FProductUsage({
        dateTo,
        dateFrom,
      })

      return adapter.excelGateway.createG4FProductUsageReport({
        usage: usage,
        product,
      })
    } else if (product === Product.GPT4FREE_EXTENDED) {
      const usage = await adapter.actionRepository.getG4FExtendedProductUsage({
        dateTo,
        dateFrom,
      })

      return adapter.excelGateway.createG4FExtendedProductUsageReport({
        usage: usage,
        product,
      })
    } else {
      //MIGRATION_ON_CLICKHOUSE
      /*const usagePG = await adapter.actionRepository.getProductUsage({
        dateTo,
        dateFrom,
        product
      })*/
      const usageCH = await adapter.actionRepository.chGetProductUsage({
        dateTo,
        dateFrom,
        product,
      })

      const report = await adapter.excelGateway.createProductUsageReport({
        usage: usageCH,
        product,
      })

      return report
    }
  }
}
