import { AdapterParams } from '@/adapter/types'
import { buildGetCurrencyToRubRate } from '@/adapter/gateway/currency-rate/get-currency-to-rub-rate'
import { CurrencyEnum } from '@/adapter/gateway/currency-rate/currency.enum'
type Params = Pick<AdapterParams, 'currencyToRubRate'>

export type CurrencyToRubRateGateway = {
  getCurrencyToRubRate: (currency: CurrencyEnum) => Promise<number>
}

export const buildCurrencyToRubRateGateway = (params: Params): CurrencyToRubRateGateway => {
  const getCurrencyToRubRate = buildGetCurrencyToRubRate(params)

  return { getCurrencyToRubRate }
}
