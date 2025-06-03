import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type GetChat = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetChat = ({ chat }: Params): GetChat => {
  return async (req, res) => {
    const data = await chat.get({
      userId: req.user?.id,
      chatId: req.params.id as string
    })

    return res.status(200).json(data)
  }
}
