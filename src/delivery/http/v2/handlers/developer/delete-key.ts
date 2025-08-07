import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'developer'>
export type DeleteKey = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteKey = ({ developer }: Params): DeleteKey => {
  return async (req, res) => {
    const data = await developer.deleteKey({
      id: req.params.id,
      userId: req.user?.id,
    })

    return res.status(200).json(data)
  }
}
