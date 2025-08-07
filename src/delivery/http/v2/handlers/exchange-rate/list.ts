import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { MAX_ITEMS } from '@/domain/entity/exchange-rate'
import { AuthRequest } from '../types'

export type ListExchangeRates = (req: AuthRequest, res: Response) => Promise<void>

export const buildListExchangeRates = ({
  exchangeRate,
}: Pick<DeliveryParams, 'exchangeRate'>): ListExchangeRates => {
  return async (req, res) => {
    let amount: number | undefined = parseInt(req.query.amount as string)

    amount = !isNaN(amount) ? Math.max(MAX_ITEMS, amount || MAX_ITEMS) : MAX_ITEMS

    const data = await exchangeRate.list({
      amount,
    })

    res.status(200).json(data)
  }
}
