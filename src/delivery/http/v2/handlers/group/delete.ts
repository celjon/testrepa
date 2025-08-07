import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>
export type Delete = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDelete = ({ group }: Params): Delete => {
  return async (req, res) => {
    const data = await group.delete({
      userId: req.user?.id,
      groupId: req.params.id,
    })

    return res.status(200).json(data)
  }
}
