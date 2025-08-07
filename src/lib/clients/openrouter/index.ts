import OpenAi from 'openai'
import { OpenRouterClient, OpenRouterModelWithEndpoints } from './types'
import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { config } from '@/config'

type Params = {
  apiUrl: string
  key?: string
}

export const newClient = ({ apiUrl, key }: Params) => {
  const api = axios.create({
    baseURL: apiUrl,
  })
  const { enabled, host, port, protocol, auth } = config.openrouter_proxy

  const client = new OpenAi({
    apiKey: key ?? ' ',
    baseURL: apiUrl,
    defaultHeaders: {
      'HTTP-Referer': 'https://bothub.chat',
    },
    httpAgent: enabled
      ? new SocksProxyAgent(`${protocol}://${auth.username}:${auth.password}@${host}:${port}`)
      : undefined,
  }) as OpenRouterClient

  client.getModels = async () => {
    const { data } = await api.get('/models')

    return data.data
  }

  client.getModelProviders = async (author: string, slug: string) => {
    const models = await client.models.list()
    const model = models.data.find((model) => model.id === `${author}/${slug}`)

    const permaslug = model ? (model as any).canonical_slug : `${author}%2F${slug}`

    const providers = (
      await axios.get(`https://openrouter.ai/api/frontend/stats/endpoint?permaslug=${permaslug}`)
    ).data.data as OpenRouterModelWithEndpoints[]
    return providers
  }

  return {
    client,
  }
}

export * from './types'
