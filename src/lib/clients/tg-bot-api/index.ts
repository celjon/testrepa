import axios from 'axios'
import { TgBotApiClient } from './types'

type Params = {
  webhookUrl: string
  pythonWebHookUrl?: string
  secretKey: string
}

export const newClient = ({
  webhookUrl,
  pythonWebHookUrl,
  secretKey,
}: Params): { client: TgBotApiClient } => {
  const api = axios.create({
    baseURL: webhookUrl,
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
    },
  )

  const pythonApi = axios.create({
    baseURL: pythonWebHookUrl,
  })
  pythonApi.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/json'
    config.headers.botsecretkey = secretKey
    return config
  })

  pythonApi.interceptors.response.use(
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
    },
  )

  const client: TgBotApiClient = {
    sendMessage: async (data): Promise<void> => {
      const results = await Promise.allSettled([
        api.post<void>('', data),
        pythonWebHookUrl && pythonApi.post<void>('', data),
      ])

      if (results.every((result) => result.status === 'rejected')) {
        throw results
      }
    },
    mergeAccounts: async (data): Promise<void> => {
      const results = await Promise.allSettled([
        api.post<void>('', data),
        pythonWebHookUrl && pythonApi.post<void>('', data),
      ])

      if (results.every((result) => result.status === 'rejected')) {
        throw results
      }
    },
    notifyAboutPresent: async (data): Promise<void> => {
      const results = await Promise.allSettled([
        api.post<void>('', data),
        pythonWebHookUrl && pythonApi.post<void>('', data),
      ])

      if (results.every((result) => result.status === 'rejected')) {
        throw results
      }
    },
    unlinkAccount: async (data): Promise<void> => {
      const results = await Promise.allSettled([
        api.post<void>('', data),
        pythonWebHookUrl && pythonApi.post<void>('', data),
      ])

      if (results.every((result) => result.status === 'rejected')) {
        throw results
      }
    },
  }
  return {
    client,
  }
}

export * from './types'
