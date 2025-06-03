import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type BalanceAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildBalanceAccount = ({ model }: Params): BalanceAccount => {
  return async (req, res) => {
    const updatedAccountQueues = await model.balanceAccount()

    return res.status(200).json(updatedAccountQueues)
  }
}
