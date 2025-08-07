import { Response } from 'express'
import { config } from '@/config'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'preset'>

export type GetFilters = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetFilters = ({ preset }: Params): GetFilters => {
  return async (req, res) => {
    const data = await preset.getFilters({
      locale: (req.query.locale ?? config.frontend.default_locale).toString(),
    })

    return res.status(200).json(data)
  }
}
