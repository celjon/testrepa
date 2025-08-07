import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type CreateChat = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateChat = ({ chat }: Params): CreateChat => {
  return async (req, res) => {
    const data = await chat.create({
      userId: req.user.id,
      groupId: req.body.groupId,
      name: req.body.name,
      modelId: req.body.modelId,
      highlight: req.body.highlight,
      platform: req.body.platform?.toUpperCase(),
      order: req.body.order,
    })

    return res.status(200).json(data)
  }
}
