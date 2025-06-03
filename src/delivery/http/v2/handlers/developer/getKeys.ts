import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'developer'>
export type GetKeys = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetKeys = ({ developer }: Params): GetKeys => {
  return async (req, res) => {
    const data = await developer.getKeys({
      userId: req.user?.id
    })

    return res.status(200).json(data)
  }
}
