import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referralTemplate'>
export type DeleteReferralTemplate = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteReferralTemplate = ({ referralTemplate }: Params): DeleteReferralTemplate => {
  return async (req, res) => {
    const template = await referralTemplate.delete({
      userId: req.user?.id,
      id: req.params.id as string
    })
    return res.status(200).json(template)
  }
}
