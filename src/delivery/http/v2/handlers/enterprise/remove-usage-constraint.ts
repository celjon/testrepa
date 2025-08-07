import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>

export type RemoveUsageConstraint = (req: AuthRequest, res: Response) => Promise<Response>

export const buildRemoveUsageConstraint = ({ enterprise }: Params): RemoveUsageConstraint => {
  return async (req, res) => {
    const result = await enterprise.removeUsageConstraint({
      userId: req.user?.id,
      enterpriseId: req.params.enterpriseId,
      constraintId: req.params.constraintId,
    })

    return res.status(200).json(result)
  }
}
