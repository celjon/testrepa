import axios from 'axios'
import { TgBotApiClient } from './types'

type Params = {
  webhookUrl: string
  secretKey: string
}

export const newClient = ({ webhookUrl, secretKey }: Params): { client: TgBotApiClient } => {
  const api = axios.create({
    baseURL: webhookUrl
  })
  api.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/json'
    config.headers.botsecretkey = secretKey
    return config
  })

  api.interceptors.response.use(
    (resp) => resp,
    (err) => {
      const originalRequest = err.config

      if (!originalRequest._retries) {
        originalRequest._retries = 0
      }

      if (originalRequest._retries < 3) {
        originalRequest._retries++
        return api(originalRequest)
      }

      return Promise.reject(err)
    }
  )

  const client: TgBotApiClient = {
    sendMessage: async (data): Promise<void> => {
      await api.post<void>('', data)
    },
    mergeAccounts: async (data): Promise<void> => {
      await api.post<void>('', data)
    },
    notifyAboutPresent: async (data): Promise<void> => {
      await api.post<void>('', data)
    },
    unlinkAccount: async (data): Promise<void> => {
      await api.post<void>('', data)
    }
  }
  return {
    client
  }
}

export * from './types'
