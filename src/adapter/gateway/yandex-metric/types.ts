export type SendOfflineConversionParams = {
  yandexMetricClientId: string | null
  userId: string
  yandexMetricYclid: string | null
  purchaseId?: string
  goal: string
  price?: number
  currency?: string
}

export type SendOfflineConversion = (params: SendOfflineConversionParams) => Promise<void>
