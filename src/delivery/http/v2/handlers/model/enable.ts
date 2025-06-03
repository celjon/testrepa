import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'model'>

export type Enable = (req: AuthRequest, res: Response) => Promise<Response>

export const buildEnable = ({ model }: Params): Enable => {
  return async (req, res) => {
    const models = await model.enable({
      userId: req.user.id,
      modelId: req.body.modelId,
      platform: req.body.platform
    })

    return res.status(200).json(models)
  }
}
