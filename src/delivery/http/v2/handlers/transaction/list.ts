import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'transaction'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ transaction }: Params): List => {
  return async (req, res) => {
    const transactions = await transaction.list({
      userId: req.user?.id,
      page: req.query.page as any as number
    })

    return res.status(200).json(transactions)
  }
}
