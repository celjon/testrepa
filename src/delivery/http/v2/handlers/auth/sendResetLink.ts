import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'
import { getLocale } from '@/lib/utils/getLocale'

type Params = Pick<DeliveryParams, 'auth'>
export type SendResetLink = (req: AuthRequest, res: Response) => Promise<Response>
export const buildSendResetLink = ({ auth }: Params): SendResetLink => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])

    await auth.sendResetLink({
      email: req.body.email?.toLowerCase(),
      metadata: {
        locale
      }
    })
    return res.status(200).end()
  }
}
