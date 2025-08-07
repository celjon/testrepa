import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'plan'>
export type PlanAddModel = (req: AuthRequest, res: Response) => Promise<void>

export const buildPlanAddModel = ({ plan }: Params): PlanAddModel => {
  return async (req, res) => {
    await plan.addModel({
      planId: req.params.id,
      userId: req.user?.id,
      modelId: req.body.modelId,
    })

    res.status(200).end()
  }
}
