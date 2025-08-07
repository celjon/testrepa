import { SearchParams, SearchResultsAndContents } from '@/adapter/gateway/web-search/types'
import Exa from 'exa-js'

export type ExaAIClient = {
  getSearchResultsAndContents: (params: SearchParams) => Promise<SearchResultsAndContents>
}

type Params = {
  apiKey: string
}

export const newClient = ({ apiKey }: Params): { client: ExaAIClient } => {
  const exa = new Exa(apiKey)

  return {
    client: {
      getSearchResultsAndContents: async (
        params: SearchParams,
      ): Promise<SearchResultsAndContents> => {
        const response = await exa.searchAndContents(params.query, {
          numResults: params.numResults,
          livecrawl: 'preferred',
          text: true,
          type: 'keyword',
          filterEmptyResults: true,
          excludeDomains: ['www.youtube.com', 'youtu.be', 'youtube.com'],
        })

        return {
          ...response,
          results: response.results.map((res) => ({
            url: res.url,
            title: res.title,
            snippet: null,
            content: res.text ?? '',
          })),
          costDollars: (
            response as unknown as {
              costDollars: {
                total: number
              }
            }
          ).costDollars.total,
        }
      },
    },
  }
}
