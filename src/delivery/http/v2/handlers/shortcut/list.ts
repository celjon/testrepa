import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'shortcut'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ shortcut }: Params): List => {
  return async (req, res) => {
    const data = await shortcut.list({
      userId: req.user?.id
    })

    return res.status(200).json(data)
  }
}
