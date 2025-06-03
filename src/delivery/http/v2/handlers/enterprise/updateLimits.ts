import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>

export type UpdateEnterpriseLimits = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateEnterpriseLimits = ({ enterprise }: Params): UpdateEnterpriseLimits => {
  return async (req, res) => {
    const data = await enterprise.updateLimits({
      id: req.params.id,
      userId: req.user?.id,
      hard_limit: req.body.hard_limit,
      soft_limit: req.body.soft_limit
    })

    return res.status(200).json(data)
  }
}
