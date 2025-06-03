import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type GetCategories = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetCategories = ({ preset }: Params): GetCategories => {
  return async (req, res) => {
    const data = await preset.getCategories({
      locale: req.query.locale as string | undefined
    })

    return res.status(200).json(data)
  }
}
