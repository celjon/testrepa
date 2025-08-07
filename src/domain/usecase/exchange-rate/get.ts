import { UseCaseParams } from '../types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'
import { NotFoundError } from '@/domain/errors'

export type Get = (params: { id: string }) => Promise<IExchangeRate>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const exchangeRate = await adapter.exchangeRateRepository.get({ where: { id } })

    if (!exchangeRate) {
      throw new NotFoundError({ code: 'EXCHANGE_RATE_NOT_FOUND' })
    }

    return exchangeRate
  }
}
