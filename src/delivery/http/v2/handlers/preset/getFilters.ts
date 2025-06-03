import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type GetFilters = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetFilters = ({ preset }: Params): GetFilters => {
  return async (req, res) => {
    const data = await preset.getFilters({
      locale: (req.query.locale ?? 'en').toString()
    })

    return res.status(200).json(data)
  }
}
