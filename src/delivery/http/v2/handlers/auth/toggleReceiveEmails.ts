import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'auth'>

export type ToggleReceiveEmails = (request: AuthRequest, response: Response) => Promise<void>

export const buildToggleReceiveEmails = ({ auth }: Params): ToggleReceiveEmails => {
  return async (req, res) => {
    const result = await auth.toggleReceiveEmails({
      userId: req.user?.id,
      receiveEmails: req.body.receiveEmails
    })
    res.status(200).json(result)
  }
}
