import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>
export type ListAll = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListAll = ({ model }: Params): ListAll => {
  return async (req, res) => {
    const models = await model.listAll()

    return res.status(200).json(models)
  }
}
