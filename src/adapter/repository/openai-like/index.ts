import { AdapterParams } from '@/adapter/types'
import { buildListModels, ListModels } from './list-models'

type Params = Pick<AdapterParams, 'db' | 'openaiBalancer' | 'openRouterBalancer'>

export type OpenaiLikeRepository = {
  listModels: ListModels
}
export const buildOpenaiLikeRepository = (params: Params): OpenaiLikeRepository => {
  const listModels = buildListModels(params)
  return {
    listModels,
  }
}
