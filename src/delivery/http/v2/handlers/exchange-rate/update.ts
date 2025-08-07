import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'exchangeRate'>

export type UpdateExchangeRate = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdateExchangeRate = ({ exchangeRate }: Params): UpdateExchangeRate => {
  return async (req, res) => {
    const result = await exchangeRate.update({
      id: req.params.exchangeRateId,
      start_date: new Date(req.body.start_date),
      caps_per_rub: req.body.caps_per_rub,
      caps_per_usd: req.body.caps_per_usd,
    })

    res.status(200).json(result)
  }
}
