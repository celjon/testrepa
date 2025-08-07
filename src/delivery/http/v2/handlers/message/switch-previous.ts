import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type SwitchPrevious = (req: AuthRequest, res: Response) => Promise<Response>

export const buildSwitchPrevious = ({ message }: Params): SwitchPrevious => {
  return async (req, res) => {
    const data = await message.switch({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      id: req.params.id,
      direction: 'previous',
    })

    return res.status(200).json(data)
  }
}
