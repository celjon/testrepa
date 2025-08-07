import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'shortcut'>
export type Update = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdate = ({ shortcut }: Params): Update => {
  return async (req, res) => {
    const data = await shortcut.update({
      userId: req.user?.id,
      shortcutId: req.params.id,
      name: req.body.name,
      text: req.body.text,
      autosend: req.body.autosend,
    })

    return res.status(200).json(data)
  }
}
