import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>

export type AddUsageConstraint = (req: AuthRequest, res: Response) => Promise<Response>

export const buildAddUsageConstraint = ({ enterprise }: Params): AddUsageConstraint => {
  return async (req, res) => {
    const result = await enterprise.addUsageConstraint({
      userId: req.user?.id,
      enterpriseId: req.params.enterpriseId,
      constraint: req.body.constraint,
    })

    return res.status(200).json(result)
  }
}
