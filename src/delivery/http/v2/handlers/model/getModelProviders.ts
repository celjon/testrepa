import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type GetModelProviders = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetModelProviders = ({ model }: Params): GetModelProviders => {
  return async (req, res) => {
    const providers = await model.getModelProviders({
      id: req.params.id,
      sort: req.query?.sort as any as string,
      sortDirection: req.query?.sortDirection as any as string
    })

    return res.status(200).json(providers)
  }
}
