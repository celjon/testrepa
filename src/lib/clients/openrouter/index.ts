import OpenAi from 'openai'
import { OpenRouterClient, OpenRouterModelWithEndpoints } from './types'
import axios from 'axios'

type Params = {
  apiUrl: string
  key?: string
}

export const newClient = ({ apiUrl, key }: Params) => {
  const api = axios.create({
    baseURL: apiUrl
  })

  const client = new OpenAi({
    apiKey: key ?? ' ',
    baseURL: apiUrl,
    defaultHeaders: {
      'HTTP-Referer': 'https://bothub.chat'
    },
  }) as OpenRouterClient

  client.getModels = async () => {
    const { data } = await api.get('/models')

    return data.data
  }

  client.getModelProviders = async (author: string, slug: string) => {
    const providers = (await axios.get(`https://openrouter.ai/api/frontend/stats/endpoint?permaslug=${author}%2F${slug}`)).data
      .data as OpenRouterModelWithEndpoints[]
    return providers
  }

  return {
    client
  }
}

export * from './types'
