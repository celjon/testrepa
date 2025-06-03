import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>

export type Stop = (req: AuthRequest, res: Response) => Promise<Response>

export const buildStop =
  ({ chat }: Params): Stop =>
  async (req, res) => {
    await chat.stop({
      userId: req.user.id,
      chatId: req.params.id
    })

    return res.status(200).send()
  }
