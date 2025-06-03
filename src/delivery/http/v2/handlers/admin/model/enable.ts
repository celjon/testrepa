import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>
export type ModelEnable = (req: AuthRequest, res: Response) => Promise<void>

export const buildModelEnable = ({ model }: Params): ModelEnable => {
  return async (req, res) => {
    const data = await model.enable({
      userId: req.user?.id,
      modelId: req.body.modelId,
      platform: req.body.platform
    })

    res.status(200).json(data)
  }
}
