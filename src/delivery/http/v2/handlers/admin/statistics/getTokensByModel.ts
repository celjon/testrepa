import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'statistics'>

export type GetTokensByModel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetTokensByModel = ({ statistics }: Params): GetTokensByModel => {
  return async (req, res) => {
    const data = await statistics.getTokensByModel({
      userId: req.user.id,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string
    })

    return res.status(200).json(data)
  }
}
