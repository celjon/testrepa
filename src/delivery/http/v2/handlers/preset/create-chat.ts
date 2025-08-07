import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type CreateChat = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateChat = ({ preset }: Params): CreateChat => {
  return async (req, res) => {
    const data = await preset.createChat({
      id: req.params.id,
      userId: req.user?.id,
      chatId: req.body.chatId,
    })

    return res.status(200).json(data)
  }
}
