import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type Excel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildExcel = ({ transaction }: Params): Excel => {
  return async (req, res) => {
    const excel = await transaction.excel({
      userId: req.user?.id,
    })

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader('Content-Disposition', 'attachment; filename="vblgruzka.xlsx"')

    return res.end(excel)
  }
}
