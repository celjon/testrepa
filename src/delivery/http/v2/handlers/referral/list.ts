import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referral'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ referral }: Params): List => {
  return async (req, res) => {
    const data = await referral.list({
      userId: req.user?.id
    })
    return res.status(200).json(data)
  }
}
