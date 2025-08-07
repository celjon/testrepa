import { AdapterParams } from '@/adapter/types'
import { OpenRouterModelWithEndpoints } from '@/lib/clients/openrouter'

type Params = Pick<AdapterParams, 'openRouter'>

export type GetModelProviders = (params: {
  author: string
  slug: string
}) => Promise<OpenRouterModelWithEndpoints[]>

export const buildGetModelProviders =
  ({ openRouter }: Params): GetModelProviders =>
  ({ author, slug }) =>
    openRouter.client.getModelProviders(author, slug)
