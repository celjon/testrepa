import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ message }: Params): Update => {
  return async (req, res) => {
    const data = await message.update({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      id: req.params.id,
      content: req.body.content
    })

    return res.status(200).json(data)
  }
}
