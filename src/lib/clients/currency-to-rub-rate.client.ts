import axios, { AxiosResponse } from 'axios'
import { CurrencyEnum } from '@/adapter/gateway/currency-rate/currency.enum'

export type CurrencyToRubRateClientConfig = {
  currency: CurrencyEnum
}

export type CurrencyToRubRateClient = {
  getCurrencyToRubRate: (params: { currency: CurrencyEnum }) => Promise<number>
}

export const newClient = () => {
  return {
    client: {
      getCurrencyToRubRate: async ({ currency }: CurrencyToRubRateClientConfig) => {
        const response: AxiosResponse = await axios.get('https://www.cbr-xml-daily.ru/latest.js')
        const currencyCode = CurrencyEnum[currency]
        const rate = response.data.rates[currencyCode]
        return 1 / rate
      },
    },
  }
}
/*type AxiosResponse.data = {
  disclaimer: string
  date: string
  timestamp: Date
  base: string
  rates: {
    AUD: number
    AZN: number
    GBP: number
    AMD: number
    BYN: number
    BGN: number
    BRL: number
    HUF: number
    VND: number
    HKD: number
    GEL: number
    DKK: number
    AED: number
    USD: number
    EUR: number
    EGP: number
    INR: number
    IDR: number
    KZT: number
    CAD: number
    QAR: number
    KGS: number
    CNY: number
    MDL: number
    NZD: number
    NOK: number
    PLN: number
    RON: number
    XDR: number
    SGD: number
    TJS: number
    THB: number
    TRY: number
    TMT: number
    UZS: number
    UAH: number
    CZK: number
    SEK: number
    CHF: number
    RSD: number
    ZAR: number
    KRW: number
    JPY: number
  }
}*/
