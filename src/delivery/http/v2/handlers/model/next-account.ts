import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type NextAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildNextAccount = ({ model }: Params): NextAccount => {
  return async (req, res) => {
    const accountQueue = await model.nextAccount({
      queueId: req.body.queueId,
    })

    return res.status(200).json(accountQueue)
  }
}
