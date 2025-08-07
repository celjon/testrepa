import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type DeleteCustom = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteCustom = ({ model }: Params): DeleteCustom => {
  return async (req, res) => {
    const custom = await model.deleteCustom({
      customId: req.params.id,
    })

    return res.status(200).json(custom)
  }
}
