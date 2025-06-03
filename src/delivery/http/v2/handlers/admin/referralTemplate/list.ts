import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referralTemplate'>
export type ListReferralTemplate = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListReferralTemplate = ({ referralTemplate }: Params): ListReferralTemplate => {
  return async (req, res) => {
    const template = await referralTemplate.list({
      page: req.query.page as any,
      search: req.query.search as string,
      locale: req.query.locale as string,
      userId: req.user?.id
    })
    return res.status(200).json(template)
  }
}
