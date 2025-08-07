import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referral'>
export type Withdraw = (req: AuthRequest, res: Response) => Promise<Response>

export const buildWithdraw = ({ referral }: Params): Withdraw => {
  return async (req, res) => {
    const data = await referral.withdraw({
      userId: req.user?.id,
      id: req.params.id,
      details: req.body.details,
    })
    return res.status(200).json(data)
  }
}
