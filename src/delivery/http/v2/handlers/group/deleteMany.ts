import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>
export type DeleteMany = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteMany = ({ group }: Params): DeleteMany => {
  return async (req, res) => {
    const data = await group.deleteMany({
      userId: req.user?.id,
      ids: req.body.ids
    })

    return res.status(200).json(data)
  }
}
