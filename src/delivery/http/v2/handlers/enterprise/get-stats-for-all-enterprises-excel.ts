import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>

export type GetStatsForAllEnterprisesExcel = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetStatsForAllEnterprisesExcel = ({ enterprise }: Params): GetStatsForAllEnterprisesExcel => {
  return async (req, res) => {
    let year: string | undefined = req.query.year ? String(req.query.year) : undefined
    let month: string | undefined = req.query.month ? String(+req.query.month + 1) : undefined

    try {
      const fileBuffer = await enterprise.getEmployeesStatsTotalTokensUsedExcel({
        userId: req.user?.id,
        year,
        month
      })
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx')
      res.send(fileBuffer)
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}
