import { config } from '@/config'
import axios from 'axios'

const OAUTH_TOKEN = config.metrics.yandex.access_token
const COUNTER_ID = config.metrics.yandex.counter
export type YandexMetricClientConfig = {
  formData: FormData
}

export type YandexMetricClient = {
  sendOfflineConversion: (params: { formData: FormData }) => Promise<void>
}

export const newClient = () => {
  return {
    client: {
      sendOfflineConversion: async ({ formData }: YandexMetricClientConfig) => {
        await axios.post(`https://api-metrika.yandex.net/management/v1/counter/${COUNTER_ID}/offline_conversions/upload`, formData, {
          headers: {
            Authorization: `OAuth ${OAUTH_TOKEN}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      }
    }
  }
}
