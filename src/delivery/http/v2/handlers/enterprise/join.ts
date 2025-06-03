import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type JoinEnterprise = (req: AuthRequest, res: Response) => Promise<Response>

export const buildJoinEnterprise = ({ enterprise }: Params): JoinEnterprise => {
  return async (req, res) => {
    const subscription = await enterprise.join({
      inviteToken: req.body.inviteToken,
      userId: req.user?.id
    })

    return res.status(200).json(subscription)
  }
}
