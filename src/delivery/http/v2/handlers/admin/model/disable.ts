import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../../types'

type Params = Pick<DeliveryParams, 'model'>
export type ModelDisable = (req: AuthRequest, res: Response) => Promise<void>

export const buildModelDisable = ({ model }: Params): ModelDisable => {
  return async (req, res) => {
    const data = await model.disable({
      userId: req.user?.id,
      modelId: req.body.modelId,
      platform: req.body.platform,
    })

    res.status(200).json(data)
  }
}
