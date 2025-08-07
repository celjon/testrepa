import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>
export type GenerateTelegramUnlinkToken = (req: AuthRequest, res: Response) => Promise<Response>
export const buildGenerateTelegramUnlinkToken = ({ auth }: Params): GenerateTelegramUnlinkToken => {
  return async (req, res) => {
    const result = await auth.generateTelegramUnlinkToken({
      userId: req.user?.id,
    })
    return res.status(200).json(result)
  }
}
