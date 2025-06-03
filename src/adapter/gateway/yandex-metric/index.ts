import { buildSendOfflineConversion } from '@/adapter/gateway/yandex-metric/send'
import { SendOfflineConversionParams } from '@/adapter/gateway/yandex-metric/types'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'yandexMetric' | 'currencyToRubRate'>

export type YandexMetricGateway = {
  sendOfflineConversion: (params: SendOfflineConversionParams) => Promise<void>
}

export const buildYandexMetricGateway = (params: Params): YandexMetricGateway => {
  const sendOfflineConversion = buildSendOfflineConversion(params)

  return { sendOfflineConversion }
}
