import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type Delete = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDelete = ({ message }: Params): Delete => {
  return async (req, res) => {
    const data = await message.delete({
      userId: req.user?.id,
      id: req.params.id,
    })

    return res.status(200).json(data)
  }
}
