import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'plan'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ plan }: Params): List => {
  return async (req, res) => {
    const plans = await plan.list()

    return res.status(200).json(plans)
  }
}
