import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type CreateCategory = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateCategory = ({ preset }: Params): CreateCategory => {
  return async (req, res) => {
    const data = await preset.createCategory({
      code: req.body.code,
      locale: req.body.locale,
      name: req.body.name
    })

    return res.status(200).json(data)
  }
}
