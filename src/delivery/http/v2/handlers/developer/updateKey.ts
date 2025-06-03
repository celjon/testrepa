import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'developer'>
export type UpdateKey = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateKey = ({ developer }: Params): UpdateKey => {
  return async (req, res) => {
    const data = await developer.updateKey({
      id: req.params?.id,
      userId: req.user?.id,
      label: req.body?.label
    })

    return res.status(200).json(data)
  }
}
