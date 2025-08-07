import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>

export type Logout = (req: AuthRequest, res: Response) => Promise<Response>

export const buildLogout = ({ auth }: Params): Logout => {
  return async (req, res) => {
    await auth.logout({
      userId: req.user?.id,
      refreshToken: req.body.refreshToken,
    })
    return res.status(200).json({ message: 'SESSION_LOGOUT' })
  }
}
