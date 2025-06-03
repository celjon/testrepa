import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale } from '@/lib'

type Params = Pick<DeliveryParams, 'user'>
export type SendVerifyUpdating = (req: AuthRequest, res: Response) => Promise<void>

export const buildSendVerifyUpdating = ({ user }: Params): SendVerifyUpdating => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])
    await user.sendVerifyUpdating({
      userId: req.user?.id,
      email: req.body.email,
      metadata: {
        locale
      }
    })
    res.status(200).json({})
  }
}
