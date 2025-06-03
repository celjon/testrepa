import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'model'>

export type CheckAccountQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCheckAccountQueue = ({ model }: Params): CheckAccountQueue => {
  return async (req, res) => {
    const result = await model.checkAccountQueue({
      accountQueueId: req.params.id
    })

    return res.status(200).json(result)
  }
}
