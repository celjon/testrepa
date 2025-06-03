import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { prepareSortParams } from '@/domain/service/enterprise/get-employees-stats-observable'

type Params = Pick<DeliveryParams, 'enterprise'>

export type GetEmployeesStatsExcel = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetEmployeesStatsExcel = ({ enterprise }: Params): GetEmployeesStatsExcel => {
  return async (req, res) => {
    try {
      const fileBuffer = await enterprise.getEmployeesStatsExcel({
        search: req.query.search as string,
        userId: req.user?.id,
        enterpriseId: req.params.id,
        from: req.query.from ? new Date(req.query.from as string) : new Date(),
        to: req.query.to ? new Date(req.query.to as string) : new Date(),
        sort: prepareSortParams(req.query.sort as string)
      })
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx')
      res.send(fileBuffer)
    } catch (error) {
      res.status(500).send({ error: error.message })
    }
  }
}
