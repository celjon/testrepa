import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'plan'>
export type PlanRemoveModel = (req: AuthRequest, res: Response) => Promise<void>

export const buildPlanRemoveModel = ({ plan }: Params): PlanRemoveModel => {
  return async (req, res) => {
    await plan.removeModel({
      planId: req.params.id,
      userId: req.user?.id,
      modelId: req.body.modelId
    })

    res.status(200).end()
  }
}
