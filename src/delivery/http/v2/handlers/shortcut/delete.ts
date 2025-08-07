import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'shortcut'>
export type Delete = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDelete = ({ shortcut }: Params): Delete => {
  return async (req, res) => {
    const data = await shortcut.delete({
      userId: req.user?.id,
      shortcutId: req.params.id,
    })

    return res.status(200).json(data)
  }
}
