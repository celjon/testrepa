import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type ExcelGroupedByDeveloperKey = (req: AuthRequest, res: Response) => Promise<void>

export const buildExcelGroupedByDeveloperKey = ({
  transaction,
}: Params): ExcelGroupedByDeveloperKey => {
  return async (req, res) => {
    try {
      const fileBuffer = await transaction.getAggregatedUserSpendingStatsExcelByDeveloperKey({
        userId: req.user?.id,
        from: req.query.from ? new Date(req.query.from as string) : new Date(),
        to: req.query.to ? new Date(req.query.to as string) : new Date(),
      })

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      res.setHeader('Content-Disposition', 'attachment; filename=stats-by-developer-key.xlsx')
      res.send(fileBuffer)
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}
