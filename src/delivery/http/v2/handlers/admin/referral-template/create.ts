import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referralTemplate'>
export type CreateReferralTemplate = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateReferralTemplate = ({
  referralTemplate,
}: Params): CreateReferralTemplate => {
  return async (req, res) => {
    const template = await referralTemplate.create({
      name: req.body.name,
      locale: req.body.locale,
      userId: req.user?.id,
      currency: req.body.currency,
      planId: req.body.planId,
      tokens: req.body.tokens,
      minWithdrawAmount: req.body.minWithdrawAmount,
      encouragementPercentage: req.body.encouragementPercentage,
      capsEncouragementPercentage: req.body.capsEncouragementPercentage,
      isPrivate: req.body.isPrivate,
    })
    return res.status(200).json(template)
  }
}
