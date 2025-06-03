import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type CreateEnterprise = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateEnterprise = ({ enterprise }: Params): CreateEnterprise => {
  return async (req, res) => {
    const data = await enterprise.create({
      name: req.body.name,
      agreement_conclusion_date: req.body.agreement_conclusion_date ?? null,
      type: req.body.type,
      rubs_per_million_caps: Number(req.body.rubs_per_million_caps),
      common_pool: req.body.common_pool,
      tokens: req.body?.tokens,
      plan: req.body?.plan_id,
      ownerId: req.body?.owner_id,
      userId: req.user?.id
    })

    return res.status(200).json(data)
  }
}
