import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'exchangeRate'>

export type GetExchangeRate = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetExchangeRate = ({ exchangeRate }: Params): GetExchangeRate => {
  return async (req, res) => {
    const result = await exchangeRate.get({
      id: req.params.exchangeRateId,
    })

    res.status(200).json(result)
  }
}
