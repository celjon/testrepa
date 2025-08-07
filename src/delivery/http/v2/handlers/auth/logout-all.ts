import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>

export type LogoutAll = (req: AuthRequest, res: Response) => Promise<Response>

export const buildLogoutAll = ({ auth }: Params): LogoutAll => {
  return async (req, res) => {
    await auth.logoutAll({
      userId: req.user?.id,
    })
    return res.status(200).json({ message: 'All_SESSION_LOGOUT' })
  }
}
