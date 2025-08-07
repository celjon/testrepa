import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'shortcut'>
export type Create = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreate = ({ shortcut }: Params): Create => {
  return async (req, res) => {
    const data = await shortcut.create({
      userId: req.user?.id,
      name: req.body.name,
      text: req.body.text,
      autosend: req.body.autosend,
    })

    return res.status(200).json(data)
  }
}
