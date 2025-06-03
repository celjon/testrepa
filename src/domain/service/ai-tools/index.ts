import { buildPerformWebSearch, BuildPerformWebSearchParams, PerformWebSearch } from './web-search'

type Params = BuildPerformWebSearchParams

export type AIToolsService = {
  performWebSearch: PerformWebSearch
}

export const buildAIToolsService = (params: Params): AIToolsService => {
  return {
    performWebSearch: buildPerformWebSearch(params)
  }
}
