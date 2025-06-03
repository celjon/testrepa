import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type UpdateEnterprise = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateEnterprise = ({ enterprise }: Params): UpdateEnterprise => {
  return async (req, res) => {
    const data = await enterprise.update({
      name: req.body.name,
      agreement_conclusion_date: req.body.agreement_conclusion_date ?? null,
      rubs_per_million_caps: Number(req.body.rubs_per_million_caps),
      type: req.body.type,
      common_pool: req.body.common_pool,
      balance: req.body.balance,
      plan: req.body.plan_id,
      id: req.params.id,
      userId: req.user?.id,
      hard_limit: req.body.hard_limit,
      soft_limit: req.body.soft_limit,
      system_limit: req.body.system_limit,
      payment_plan: req.body.payment_plan
    })

    return res.status(200).json(data)
  }
}
