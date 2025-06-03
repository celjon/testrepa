import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type UpdateCategory = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateCategory = ({ preset }: Params): UpdateCategory => {
  return async (req, res) => {
    const data = await preset.updateCategory({
      id: req.params.id,
      code: req.body.code,
      locale: req.body.locale,
      name: req.body.name
    })

    return res.status(200).json(data)
  }
}
