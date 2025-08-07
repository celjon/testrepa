import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'plan'>
export type UpdatePlan = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdatePlan = ({ plan }: Params): UpdatePlan => {
  return async (req, res) => {
    await plan.update({
      planId: req.params.id,
      userId: req.user?.id,
      price: req.body.price,
      tokens: req.body.tokens,
    })

    res.status(200).end()
  }
}
