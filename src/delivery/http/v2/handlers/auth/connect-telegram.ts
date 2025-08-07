import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>
export type ConnectTelegram = (req: AuthRequest, res: Response) => Promise<Response>

export const buildConnectTelegram = ({ auth }: Params): ConnectTelegram => {
  return async (req, res) => {
    const user = await auth.connectTelegram({
      telegramConnectionToken: req.body.telegramConnectionToken,
      userId: req.user?.id,
    })
    return res.status(200).json(user)
  }
}
