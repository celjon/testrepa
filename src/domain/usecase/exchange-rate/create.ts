import { UseCaseParams } from '../types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'
import { NotFoundError } from '@/domain/errors'

export type Create = (params: {
  start_date: Date
  caps_per_rub: number
  caps_per_usd: number
}) => Promise<IExchangeRate>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ start_date, caps_per_rub, caps_per_usd }) => {
    const exchangeRate = await adapter.exchangeRateRepository.create({
      data: { start_date, caps_per_rub, caps_per_usd },
    })

    if (!exchangeRate) {
      throw new NotFoundError({ code: 'EXCHANGE_RATE_NOT_CREATED' })
    }

    return exchangeRate
  }
}
