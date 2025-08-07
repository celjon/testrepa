import { AdapterParams } from '@/adapter/types'
import { SendOfflineConversion } from '@/adapter/gateway/yandex-metric/types'
import { CurrencyEnum } from '@/adapter/gateway/currency-rate/currency.enum'

type Params = Pick<AdapterParams, 'yandexMetric' | 'currencyToRubRate'>

export const buildSendOfflineConversion = ({
  yandexMetric,
  currencyToRubRate,
}: Params): SendOfflineConversion => {
  return async ({
    yandexMetricClientId,
    userId,
    yandexMetricYclid,
    purchaseId,
    goal,
    price,
    currency,
  }) => {
    const dateTime = Math.floor(Date.now() / 1000 - 15)
    if (price && currency && currency === 'USD') {
      const rate = await currencyToRubRate.client.getCurrencyToRubRate({
        currency: CurrencyEnum.USD,
      })
      if (rate) {
        price = price * rate
        currency = 'RUB'
      }
    }
    if (price && currency && currency === 'EUR') {
      const rate = await currencyToRubRate.client.getCurrencyToRubRate({
        currency: CurrencyEnum.EUR,
      })
      if (rate) {
        price = price * rate
        currency = 'RUB'
      }
    }
    const csvData = `ClientId,UserId,yclid,PurchaseId,Target,DateTime,Price,Currency\n${yandexMetricClientId},${userId},${yandexMetricYclid},${purchaseId},${goal},${dateTime},${price},${currency}`
    const formData = new FormData()
    formData.append('file', new Blob([csvData], { type: 'text/csv' }), 'conversions.csv')
    await yandexMetric.client.sendOfflineConversion({ formData })
  }
}
