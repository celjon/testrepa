import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type Get = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGet = ({ message }: Params): Get => {
  return async (req, res) => {
    const data = await message.get({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      id: req.params.id,
    })

    return res.status(200).json(data)
  }
}
