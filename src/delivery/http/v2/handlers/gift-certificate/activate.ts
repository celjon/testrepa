import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'giftCertificate'>
export type Activate = (req: AuthRequest, res: Response) => Promise<void>

export const buildActivate = ({ giftCertificate }: Params): Activate => {
  return async (req, res) => {
    const certificate = await giftCertificate.activate({
      userId: req.user?.id,
      code: req.body.code,
    })
    res.status(200).json({ certificate })
  }
}
