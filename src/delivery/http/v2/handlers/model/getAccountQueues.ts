import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type GetAccountQueues = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetAccountQueues = ({ model }: Params): GetAccountQueues => {
  return async (req, res) => {
    const modelAccountQueues = await model.getAccountQueues()

    return res.status(200).json(modelAccountQueues)
  }
}
