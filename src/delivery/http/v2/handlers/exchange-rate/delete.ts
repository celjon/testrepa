import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'exchangeRate'>

export type DeleteExchangeRate = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteExchangeRate = ({ exchangeRate }: Params): DeleteExchangeRate => {
  return async (req, res) => {
    const result = await exchangeRate.delete({
      id: req.params.exchangeRateId,
    })

    res.status(200).json(result)
  }
}
