import { UseCaseParams } from '../types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

export type List = (params: { amount?: number }) => Promise<IExchangeRate[] | never>

export const buildList = ({ adapter }: UseCaseParams): List => {
  return async ({ amount }) => {
    return await adapter.exchangeRateRepository.list({
      orderBy: {
        start_date: 'desc',
      },
      ...(amount && { take: amount }),
    })
  }
}
