import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>

export type EnableEncryption = (req: AuthRequest, res: Response) => Promise<Response>

export const buildEnableEncryption = ({ auth }: Params): EnableEncryption => {
  return async (req, res) => {
    const user = await auth.enableEncryption({
      userId: req.user?.id,
      password: req.body.password
    })
    return res.status(200).json(user)
  }
}
