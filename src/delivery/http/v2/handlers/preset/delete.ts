import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { toJSONString } from '@/lib'

type Params = Pick<DeliveryParams, 'preset'>

export type Delete = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDelete = ({ preset }: Params): Delete => {
  return async (req, res) => {
    const data = await preset.delete({
      id: req.params.id,
      userId: req.user?.id,
    })

    return res.status(200).header('Content-Type', 'application/json').send(toJSONString(data))
  }
}
