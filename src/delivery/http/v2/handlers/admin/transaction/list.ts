import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type TransactionList = (req: AuthRequest, res: Response) => Promise<Response>

export const buildTransactionList = ({ transaction }: Params): TransactionList => {
  return async (req, res) => {
    const transactions = await transaction.listById({
      userId: req.user.id,
      id: req.params.id,
      page: 1,
    })

    return res.status(200).json(transactions)
  }
}
