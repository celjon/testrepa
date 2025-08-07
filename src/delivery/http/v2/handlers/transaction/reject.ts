import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type Reject = (req: AuthRequest, res: Response) => Promise<Response>

export const buildReject = ({ transaction }: Params): Reject => {
  return async (req, res) => {
    const transactions = await transaction.reject({
      userId: req.user?.id,
      id: req.params.id as string,
    })

    return res.status(200).json(transactions)
  }
}
