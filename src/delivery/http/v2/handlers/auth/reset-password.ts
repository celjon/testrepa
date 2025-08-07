import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>
export type ResetPassword = (req: AuthRequest, res: Response) => Promise<Response>
export const buildResetPassword = ({ auth }: Params): ResetPassword => {
  return async (req, res) => {
    await auth.resetPassword({
      password: req.body.password,
      token: req.body.token,
    })
    return res.status(200).end()
  }
}
