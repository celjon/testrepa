import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>

export type ClearContext = (req: AuthRequest, res: Response) => Promise<Response>

export const buildClearContext = ({ chat }: Params): ClearContext => {
  return async (req, res) => {
    await chat.clearContext({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      chatId: req.params.id,
    })

    return res.status(201).send()
  }
}
