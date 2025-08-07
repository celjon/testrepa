import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale } from '@/lib'

type Params = Pick<DeliveryParams, 'giftCertificate'>
export type Create = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreate = ({ giftCertificate }: Params): Create => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])
    const certificate = await giftCertificate.create({
      userId: req.user?.id,
      amount: req.body.amount,
      message: req.body.message,
      recipient_name: req.body.recipient_name,
      locale,
    })
    res.status(200).json({ certificate })
  }
}
