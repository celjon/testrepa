import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'user'>

export type UpdateRegion = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateRegion = ({ user }: Params): UpdateRegion => {
  return async (req, res) => {
    const updatedUser = await user.updateRegion({
      userId: req.user?.id,
      region: req.body.region,
    })

    return res.status(200).json(updatedUser)
  }
}
