import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>

export type ListAll = (req: AuthRequest, res: Response) => Promise<void>

export const buildListAll = ({ message }: Params): ListAll => {
  return async (req, res) => {
    const data = await message.listAll({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      chatId: req.query.chatId as any as string,
    })

    res.status(200).json(data)
  }
}
