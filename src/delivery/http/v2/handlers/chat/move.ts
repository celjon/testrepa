import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>

export type Move = (req: AuthRequest, res: Response) => Promise<Response>

export const buildMove =
  ({ chat }: Params): Move =>
  async (req, res) => {
    const chats = await chat.move({
      userId: req.user.id,
      chatIds: req.body.ids,
      groupId: req.body?.groupId,
      startChatId: req.body?.startChatId
    })

    return res.status(200).send(chats)
  }
