import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type GetEnterprise = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGet = ({ enterprise }: Params): GetEnterprise => {
  return async (req, res) => {
    const data = await enterprise.get({
      id: req.query.id as string,
      userId: req.user?.id,
    })

    return res.status(200).json(data)
  }
}
