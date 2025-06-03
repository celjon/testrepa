import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type GetInitialChat = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetInitialChat = ({ chat }: Params): GetInitialChat => {
  return async (req, res) => {
    const data = await chat.getInitial({
      userId: req.user.id,
      modelId: String(req.query.modelId)
    })

    return res.status(200).json(data)
  }
}
