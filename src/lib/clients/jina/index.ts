import axios from 'axios'
import { JinaApiClient } from './types'

type Params = {
  apiUrl: string
  apiKey: string
}

export const newClient = ({ apiUrl, apiKey }: Params): { client: JinaApiClient } => {
  const api = axios.create({
    baseURL: apiUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  return {
    client: {
      getMarkdownContent: async ({ url, signal }) => {
        const { data: result } = await api.get<{
          data: {
            title: string
            description: string
            url: string
            content: string
            usage: {
              tokens: number
            }
          }
        }>(`/${url}`, {
          headers: {
            'x-respond-with': 'markdown',
            Referer: 'https://bothub.chat/',
            Accept: 'application/json',
          },
          signal: signal?.signal,
        })

        return {
          title: result.data.title,
          description: result.data.description,
          url: result.data.url,
          content: result.data.content,
          tokens: result.data.usage.tokens,
        }
      },
    },
  }
}

export * from './types'
