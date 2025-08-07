import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type DeleteMany = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteMany = ({ message }: Params): DeleteMany => {
  return async (req, res) => {
    const data = await message.deleteMany({
      userId: req.user?.id,
      ids: req.body.ids,
    })

    return res.status(200).json(data)
  }
}
