import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>

export type ListUsageConstraints = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListUsageConstraints = ({ enterprise }: Params): ListUsageConstraints => {
  return async (req, res) => {
    const result = await enterprise.listUsageConstraints({
      userId: req.user?.id,
      enterpriseId: req.params.enterpriseId
    })

    return res.status(200).json(result)
  }
}
