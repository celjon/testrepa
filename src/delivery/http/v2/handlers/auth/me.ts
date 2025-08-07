import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>
export type GetMe = (req: AuthRequest, res: Response) => Promise<Response>
export const buildGetMe = ({ auth }: Params): GetMe => {
  return async (req, res) => {
    const user = await auth.getMe({
      id: req.user?.id,
    })
    return res.status(200).json(user)
  }
}
