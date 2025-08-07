import axios from 'axios'
import { v4 } from 'uuid'
import { Payment, YoomoneyClient } from './types'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { config } from '@/config'

type Params = {
  shopId: number
  secretKey: string
}

export const newClient = ({
  shopId,
  secretKey,
}: Params): {
  client: YoomoneyClient
} => {
  const { protocol, host, port } = config.proxy
  const authCredentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64').toString()
  const api = axios.create({
    baseURL: 'https://api.yookassa.ru/v3/',
  })
  api.interceptors.request.use((config) => {
    config.headers.Authorization = `Basic ${authCredentials}`
    return config
  })

  const client: YoomoneyClient = {
    createPayment: async (data) => {
      const idempotenceKey = v4()
      const { data: payment } = await api.post<Payment>('/payments', data, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': idempotenceKey,
        },
        httpsAgent: new SocksProxyAgent(`${protocol}://${host}:${port}`),
      })
      return payment
    },
    getPayment: async (paymentId) => {
      const { data: payment } = await api.get<Payment>(`/payments/${paymentId}`)
      return payment
    },
  }

  return {
    client,
  }
}

export * from './types'
