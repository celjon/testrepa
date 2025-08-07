import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type ConnectTelegramPython = (req: AuthRequest, res: Response) => Promise<void>

export const buildConnectTelegramPython = ({ auth }: Params): ConnectTelegramPython => {
  return async (req: AuthRequest, res: Response) => {
    const result = await auth.connectTelegramPython({
      userId: req.user?.id,
      telegramConnectionToken: req.body.telegramConnectionToken,
    })

    res.status(200).json({
      data: result,
    })
  }
}
