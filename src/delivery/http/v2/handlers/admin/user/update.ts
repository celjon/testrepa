import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'user'>
export type UpdateUser = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateUser = ({ user }: Params): UpdateUser => {
  return async (req, res) => {
    const users = await user.adminUpdate({
      tokens: req.body.tokens,
      plan: req.body.plan_id,
      id: req.params.id,
      userId: req.user.id,
    })

    return res.status(200).json(users)
  }
}
