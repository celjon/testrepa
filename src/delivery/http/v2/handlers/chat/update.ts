import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ chat }: Params): Update => {
  return async (req, res) => {
    const data = await chat.update({
      userId: req.user?.id,
      id: req.params.id as string,
      name: req.body.name,
      highlight: req.body.highlight,
      modelId: req.body.modelId,
      modelFunctionId: req.body.modelFunctionId,
      initial: req.body.initial,
      groupId: req.body.groupId,
      order: req.body.order,
    })

    return res.status(200).json(data)
  }
}
