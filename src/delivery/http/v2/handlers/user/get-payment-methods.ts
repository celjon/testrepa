import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getIPFromRequest } from '@/lib'

type Params = Pick<DeliveryParams, 'user'>

export type GetPaymentMethods = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetPaymentMethods = ({ user }: Params): GetPaymentMethods => {
  return async (req, res) => {
    const data = await user.getPaymentMethods({
      userId: req.user?.id,
      ip: getIPFromRequest(req),
    })

    return res.status(200).json(data)
  }
}
