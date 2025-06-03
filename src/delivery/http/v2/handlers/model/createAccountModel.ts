import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type CreateAccountModel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateAccountModel = ({ model }: Params): CreateAccountModel => {
  return async (req, res) => {
    const account = await model.createAccountModel({
      ...req.body,
      disabled_at: typeof req.body.disabled_at === 'string' ? new Date() : req.body.disabled_at
    })

    return res.status(200).json(account)
  }
}
