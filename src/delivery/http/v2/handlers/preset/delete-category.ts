import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'preset'>

export type DeleteCategory = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteCategory = ({ preset }: Params): DeleteCategory => {
  return async (req, res) => {
    const data = await preset.deleteCategory({
      id: req.params.id,
    })

    return res.status(200).json(data)
  }
}
