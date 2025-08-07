import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { PlanCurrency, validPlanCurrencies } from '@/domain/entity/plan'

type Params = Pick<DeliveryParams, 'plan'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ plan }: Params): List => {
  return async (req, res) => {
    let includePlanModels = undefined
    let currency: PlanCurrency | undefined = undefined
    if (typeof req.query.includePlanModels === 'string') {
      includePlanModels = req.query.includePlanModels === 'true'
    }
    if (
      typeof req.query.currency === 'string' &&
      validPlanCurrencies.includes(req.query.currency as PlanCurrency)
    ) {
      currency = req.query.currency as PlanCurrency
    }

    const plans = await plan.list({
      includePlanModels,
      currency,
    })

    return res.status(200).json(plans)
  }
}
