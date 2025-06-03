import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referral'>
export type Create = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreate = ({ referral }: Params): Create => {
  return async (req, res) => {
    const data = await referral.create({
      userId: req.user?.id,
      templateId: req.body.templateId,
      name: req.body.name
    })
    return res.status(200).json(data)
  }
}
