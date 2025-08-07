import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>

export type ButtonClick = (req: AuthRequest, res: Response) => Promise<Response>

export const buildButtonClick = ({ message }: Params): ButtonClick => {
  return async (req, res) => {
    const data = await message.buttonClick({
      buttonId: req.params.buttonId,
      userId: req.user.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
    })

    return res.status(201).json(data)
  }
}
