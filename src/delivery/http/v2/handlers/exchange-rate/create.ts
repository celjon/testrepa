import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

export type CreateExchangeRate = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateExchangeRate = ({
  exchangeRate,
}: Pick<DeliveryParams, 'exchangeRate'>): CreateExchangeRate => {
  return async (req, res) => {
    const result = await exchangeRate.create({
      start_date: new Date(req.body.start_date),
      caps_per_rub: req.body.caps_per_rub,
      caps_per_usd: req.body.caps_per_usd,
    })

    res.status(200).json(result)
  }
}
