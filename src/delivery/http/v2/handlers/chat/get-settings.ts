import { Response } from 'express'
import { toJSONString } from '@/lib'
import { ChatPlatform } from '@/domain/entity/chat'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'chat'>

export type GetSettings = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetSettings =
  ({ chat }: Params): GetSettings =>
  async (req, res) => {
    const data = await chat.getSettings({
      userId: req.user.id,
      chatId: req.params.id,
      all: req.query.all === '1',
      elements: req.query.elements == '1',
      platform: (req.query.platform as string)?.toUpperCase() as ChatPlatform,
    })

    return res.status(200).header('Content-Type', 'application/json').send(toJSONString(data))
  }
