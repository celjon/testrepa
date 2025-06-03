import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { InvalidDataError } from '@/domain/errors'
import { isValidProduct } from '@/domain/entity/statistics'

type Params = Pick<DeliveryParams, 'statistics'>

export type GetProductUsageReport = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetProductUsageReport = ({ statistics }: Params): GetProductUsageReport => {
  return async (req, res) => {
    if (typeof req.query.product !== 'string' || !isValidProduct(req.query.product)) {
      throw new InvalidDataError({
        code: 'INVALID_DATA',
        message: 'Invalid parameter: product'
      })
    }

    const report = await statistics.getProductUsageReport({
      userId: req.user.id,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      product: req.query.product
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx')

    return res.send(report)
  }
}
