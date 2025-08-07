import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { toJSONString } from '@/lib'

type Params = Pick<DeliveryParams, 'preset'>

export type Unfavorite = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUnfavorite = ({ preset }: Params): Unfavorite => {
  return async (req, res) => {
    const data = await preset.unfavorite({
      id: req.params.id,
      userId: req.user?.id,
    })

    return res.status(200).header('Content-Type', 'application/json').send(toJSONString(data))
  }
}
