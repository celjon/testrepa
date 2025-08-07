import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>
export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ group }: Params): Update => {
  return async (req, res) => {
    const data = await group.update({
      userId: req.user?.id,
      id: req.params.id,
      name: req.body.name,
      highlight: req.body.highlight,
      order: req.body.order,
    })

    return res.status(200).json(data)
  }
}
