import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>
export type CreateGroup = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateGroup = ({ group }: Params): CreateGroup => {
  return async (req, res) => {
    const data = await group.create({
      userId: req.user?.id,
      name: req.body.name,
      presetId: req.body.preset_id,
      highlight: req.body.highlight,
      order: req.body.order,
    })

    return res.status(200).json(data)
  }
}
