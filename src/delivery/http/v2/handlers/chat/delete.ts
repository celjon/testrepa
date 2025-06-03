import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type DeleteChat = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteChat = ({ chat }: Params): DeleteChat => {
  return async (req, res) => {
    const data = await chat.delete({
      userId: req.user?.id,
      chatId: req.params.id as string
    })

    return res.status(200).json(data)
  }
}
