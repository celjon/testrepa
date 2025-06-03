import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type ToggleCommonPool = (req: AuthRequest, res: Response) => Promise<Response>

export const buildToggleCommonPool = ({ enterprise }: Params): ToggleCommonPool => {
  return async (req, res) => {
    const data = await enterprise.toggleCommonPool({
      id: req.params.id,
      userId: req.user?.id
    })

    return res.status(200).json(data)
  }
}
