import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'statistics'>
export type PlatformTokens = (req: AuthRequest, res: Response) => Promise<Response>

export const buildPlatformTokens = ({ statistics }: Params): PlatformTokens => {
  return async (req, res) => {
    const template = await statistics.platformTokens({
      userId: req.user.id,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    })
    return res.status(200).json(template)
  }
}
