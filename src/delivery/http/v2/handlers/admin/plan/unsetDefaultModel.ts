import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'plan'>
export type PlanUnsetDefaultModel = (req: AuthRequest, res: Response) => Promise<void>

export const buildPlanUnsetDefaultModel = ({ plan }: Params): PlanUnsetDefaultModel => {
  return async (req, res) => {
    await plan.unsetDefaultModel({
      planId: req.params.id,
      userId: req.user?.id,
      modelId: req.body.modelId
    })

    res.status(200).end()
  }
}
