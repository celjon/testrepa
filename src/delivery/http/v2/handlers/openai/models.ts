import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'openai'>
export type Models = (req: AuthRequest, res: Response) => void

export const buildModels = ({ openai }: Params): Models => {
  return async (req, res) => {
    const models = await openai.models({
      userId: req.user.id
    })

    return res.status(200).json({
      data: models
    })
  }
}
