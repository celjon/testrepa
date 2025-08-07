import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type DeleteMany = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteMany = ({ chat }: Params): DeleteMany => {
  return async (req, res) => {
    const data = await chat.deleteMany({
      userId: req.user?.id,
      ids: req.body.ids,
    })

    return res.status(200).json(data)
  }
}
