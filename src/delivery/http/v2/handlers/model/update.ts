import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ model }: Params): Update => {
  return async (req, res) => {
    const newModel = await model.update({
      userId: req.user.id,
      ...req.body,
    })

    return res.status(200).json(newModel)
  }
}
