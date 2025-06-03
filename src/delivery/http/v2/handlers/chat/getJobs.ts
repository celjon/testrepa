import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>

export type GetJobs = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetJobs =
  ({ chat }: Params): GetJobs =>
  async (req, res) => {
    const data = await chat.getJobs({
      userId: req.user.id,
      chatId: req.params.id
    })

    return res.status(200).json(data)
  }
