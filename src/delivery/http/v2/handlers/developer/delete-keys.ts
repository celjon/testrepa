import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'developer'>
export type DeleteKeys = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteKeys = ({ developer }: Params): DeleteKeys => {
  return async (req, res) => {
    const data = await developer.deleteManyKeys({
      ids: req.body?.ids,
      userId: req.user?.id,
    })

    return res.status(200).json(data)
  }
}
