import { AdapterParams } from '@/adapter/types'
import { SearchParams } from './types'

type Params = Pick<AdapterParams, 'serpApi' | 'exaAI' | 'jinaApi'>

export type WebSearchGateway = ReturnType<typeof buildWebSearchGateway>

export const buildWebSearchGateway = ({ serpApi, exaAI, jinaApi }: Params) => {
  return {
    search: async (params: SearchParams) => {
      return serpApi.client.getSearchResults(params)
    },
    searchWithContents: async (params: SearchParams) => {
      return exaAI.client.getSearchResultsAndContents(params)
    },
    getMarkdownContent: async (params: { url: string; signal?: AbortController }) => {
      return jinaApi.client.getMarkdownContent(params)
    }
  }
}

export * from './types'
