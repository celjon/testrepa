import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type GenerateInviteToken = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGenerateInviteToken = ({ enterprise }: Params): GenerateInviteToken => {
  return async (req, res) => {
    const token = await enterprise.generateInviteToken({
      enterpriseId: req.params.enterpriseId,
      userId: req.user?.id
    })

    return res.status(200).json(token)
  }
}
