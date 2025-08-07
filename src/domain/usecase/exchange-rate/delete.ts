import { UseCaseParams } from '../types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'
import { NotFoundError } from '@/domain/errors'

export type Delete = (params: { id: string }) => Promise<IExchangeRate>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let exchangeRate = await adapter.exchangeRateRepository.get({ where: { id } })

    if (exchangeRate) {
      exchangeRate = await adapter.exchangeRateRepository.delete({ where: { id } })
    }

    if (!exchangeRate) {
      throw new NotFoundError({ code: 'EXCHANGE_RATE_NOT_FOUND' })
    }

    return exchangeRate
  }
}
