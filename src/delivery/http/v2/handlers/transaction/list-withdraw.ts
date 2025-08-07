import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type ListWithdraw = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListWithdraw = ({ transaction }: Params): ListWithdraw => {
  return async (req, res) => {
    const transactions = await transaction.listWithdraw({
      userId: req.user?.id,
    })

    return res.status(200).json(transactions)
  }
}
