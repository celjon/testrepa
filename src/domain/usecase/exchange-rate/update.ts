import { UseCaseParams } from '../types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'
import { NotFoundError } from '@/domain/errors'

export type Update = (params: {
  id: string
  start_date?: Date
  caps_per_rub?: number
  caps_per_usd?: number
}) => Promise<IExchangeRate>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ id, start_date, caps_per_rub, caps_per_usd }) => {
    let exchangeRate = await adapter.exchangeRateRepository.get({ where: { id } })

    if (exchangeRate) {
      exchangeRate = await adapter.exchangeRateRepository.update({
        where: { id },
        data: { start_date, caps_per_rub, caps_per_usd },
      })
    }

    if (!exchangeRate) {
      throw new NotFoundError({ code: 'EXCHANGE_RATE_NOT_FOUND' })
    }

    return exchangeRate
  }
}
