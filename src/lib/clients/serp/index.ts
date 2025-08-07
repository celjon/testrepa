import axios from 'axios'
import {
  GoogleScholarSearchResults,
  RawGoogleScholarSearchResults,
  RawSearchResults,
  SerpApiClient,
} from './types'
import { SearchParams, SearchResults } from 'adapter/gateway/web-search'

type Params = {
  apiUrl: string
  apiKey: string
}

// https://serpapi.com/search-api
export const newClient = ({ apiUrl, apiKey }: Params): { client: SerpApiClient } => {
  const api = axios.create({
    baseURL: apiUrl,
    params: {
      api_key: apiKey,
    },
  })

  return {
    client: {
      getSearchResults: async (params: SearchParams): Promise<SearchResults> => {
        const { data: result } = await api.get<RawSearchResults>('/search', {
          params: {
            q: params.query,
            engine: params.engine || 'google',
            location: params.location,
            start: params.skip,
            num: params.numResults,
            hl: params.language,
            gl: params.country,
            kl: params.country,
          },
        })

        if (result.search_metadata.status !== 'Success') {
          throw new Error('Search failed')
        }

        return {
          organic_results: result.organic_results,
          shopping_results: result.shopping_results,
          recipes_results: result.recipes_results,
          local_results: result.local_results,
        }
      },
      getGoogleScholarSearchResults: async (
        params: SearchParams,
      ): Promise<GoogleScholarSearchResults> => {
        try {
          const { data: result } = await api.get<RawGoogleScholarSearchResults>('/search', {
            params: {
              q: params.query,
              engine: 'google_scholar',
              location: params.location,
              start: params.skip,
              num: params.numResults,
              hl: params.language,
              gl: params.country,
              kl: params.country,
            },
          })

          if (result.search_metadata.status !== 'Success') {
            throw new Error('Search failed')
          }

          return [...result.organic_results]
        } catch (error) {
          return []
        }
      },
    },
  }
}

export * from './types'
