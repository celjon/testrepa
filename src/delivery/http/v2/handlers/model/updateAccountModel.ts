import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateAccountModel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateAccountModel = ({ model }: Params): UpdateAccountModel => {
  return async (req, res) => {
    const account = await model.updateAccountModel({
      ...req.body,
      id: req.params.id,
      ...(req.body.usageTime && {
        usageTime: new Date(req.body.usageTime)
      }),
      disabled_at: typeof req.body.disabled_at === 'string' ? new Date() : req.body.disabled_at
    })

    return res.status(200).json(account)
  }
}
