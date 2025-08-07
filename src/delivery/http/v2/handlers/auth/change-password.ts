import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'
import { getIPFromRequest } from '@/lib'

type Params = Pick<DeliveryParams, 'auth'>

export type ChangePassword = (req: AuthRequest, res: Response) => Promise<Response>

export const buildChangePassword = ({ auth }: Params): ChangePassword => {
  return async (req, res) => {
    const result = await auth.changePassword({
      userId: req.user?.id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
      ip: getIPFromRequest(req),
      user_agent: req.headers['user-agent'] ?? null,
    })
    return res.status(200).json(result)
  }
}
