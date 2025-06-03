import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'user'>
export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ user }: Params): Update => {
  return async (req, res) => {
    const updateUser = await user.update({
      userId: req.user?.id,
      name: req.body.name,
      avatar: req.file,
      email: req.body.email,
      verificationCode: req.body.verificationCode
    })

    return res.status(200).json(updateUser)
  }
}
