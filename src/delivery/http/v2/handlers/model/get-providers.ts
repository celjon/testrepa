import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type GetProviders = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetProviders = ({ model }: Params): GetProviders => {
  return async (req, res) => {
    const providers = await model.getProviders({
      ...(typeof req.query.disabled === 'string' && {
        disabled: req.query.disabled === 'true',
      }),
      ...(typeof req.query.supportedAccounts === 'string' && {
        supportedAccounts: req.query.supportedAccounts === 'true',
      }),
    })

    return res.status(200).json(providers)
  }
}
