import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>
export type GenerateTelegramConnectionToken = (req: AuthRequest, res: Response) => Promise<Response>
export const buildGenerateTelegramConnectionToken = ({
  auth,
}: Params): GenerateTelegramConnectionToken => {
  return async (req, res) => {
    const result = await auth.generateTelegramConnectionToken({
      userId: req.user?.id,
    })
    return res.status(200).json(result)
  }
}
