import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type GenerateTelegramConnectionTokenPython = (
  req: AuthRequest,
  res: Response,
) => Promise<void>
export const buildGenerateTelegramConnectionTokenPython = ({
  auth,
}: Params): GenerateTelegramConnectionTokenPython => {
  return async (req: AuthRequest, res: Response) => {
    const result = await auth.generateTelegramConnectionTokenPython({
      userId: req.user?.id,
    })

    res.status(200).json({
      data: result,
    })
  }
}
