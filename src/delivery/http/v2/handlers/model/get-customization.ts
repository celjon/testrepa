import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type GetCustomization = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetCustomization = ({ model }: Params): GetCustomization => {
  return async (req, res) => {
    const modelCustomization = await model.getCustomization()

    return res.status(200).json(modelCustomization)
  }
}
