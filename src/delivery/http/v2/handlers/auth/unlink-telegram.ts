import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>
export type UnlinkTelegram = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUnlinkTelegram = ({ auth }: Params): UnlinkTelegram => {
  return async (req, res) => {
    const user = await auth.unlinkTelegram({
      telegramUnlinkToken: req.body.telegramUnlinkToken,
    })

    return res.status(200).json(user)
  }
}
