import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'developer'>
export type CreateKey = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateKey = ({ developer }: Params): CreateKey => {
  return async (req, res) => {
    const data = await developer.createKey({
      userId: req.user?.id,
      label: req.body?.label
    })

    return res.status(200).json(data)
  }
}
