import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'message'>
export type List = (req: AuthRequest, res: Response) => Promise<void>

export const buildList = ({ message }: Params): List => {
  return async (req, res) => {
    const data = await message.list({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      chatId: req.query.chatId as any as string,
      page: Number(req.query.page),
      quantity: Number(req.query.quantity),
    })

    res.status(200).json(data)
  }
}
