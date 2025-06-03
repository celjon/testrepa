import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>
export type ModelUpdate = (req: AuthRequest, res: Response) => Promise<void>

export const buildModelUpdate = ({ model }: Params): ModelUpdate => {
  return async (req, res) => {
    const data = await model.update({
      userId: req.user?.id,
      modelId: req.body.modelId,
      label: req.body.label,
      description: req.body.description
    })

    res.status(200).json(data)
  }
}
