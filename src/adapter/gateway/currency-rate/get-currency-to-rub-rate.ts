import { AdapterParams } from '@/adapter/types'
import { CurrencyEnum } from '@/adapter/gateway/currency-rate/currency.enum'

type Params = Pick<AdapterParams, 'currencyToRubRate'>
export type GetCurrencyToRubRate = (currency: CurrencyEnum) => Promise<number>

export const buildGetCurrencyToRubRate = ({ currencyToRubRate: { client } }: Params): GetCurrencyToRubRate => {
  return async (currency) => {
    const rate = await client.getCurrencyToRubRate({ currency })
    return rate
  }
}
