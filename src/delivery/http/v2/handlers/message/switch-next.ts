import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type SwitchNext = (req: AuthRequest, res: Response) => Promise<void>

export const buildSwitchNext = ({ message }: Params): SwitchNext => {
  return async (req, res) => {
    const data = await message.switch({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      id: req.params.id,
      direction: 'next',
    })

    res.status(200).json(data)
  }
}
