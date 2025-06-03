import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateProvider = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateProvider = ({ model }: Params): UpdateProvider => {
  return async (req, res) => {
    const provider = await model.updateProvider({
      id: req.params.id,
      order: req.body.order,
      disabled: req.body.disabled,
      fallbackId: req.body.fallbackId
    })

    return res.status(200).json(provider)
  }
}
