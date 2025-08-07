import { NotFoundError } from '@/domain/errors'
import { OpenrouterGateway } from '../../../adapter/gateway/openrouter/index'

type Params = {
  openrouterGateway: OpenrouterGateway
}

export type ModelProvider = {
  modelId: string
  name: string
  context_length: number
  maxOutput: number
  lastLatency: number
  lastThroughput: number
  inputPrice: number
  imagePrice: number
  outputPrice: number
  discount: number
  stats: {
    date: Date
    throughput: number
    latency: number
    request_count: number
  }[]
}

export type GetModelProviders = (params: {
  author: string
  modelId: string
}) => Promise<ModelProvider[] | never>

export const buildGetModelProviders = ({ openrouterGateway }: Params): GetModelProviders => {
  return async ({ author, modelId }) => {
    const modelWithEndpoints = await openrouterGateway.getModelProviders({ author, slug: modelId })

    const availableProviders = await openrouterGateway.getProviders()

    const filteredProviders = modelWithEndpoints.filter((endpoint) =>
      availableProviders.includes(endpoint.provider_name),
    )
    if (filteredProviders.length === 0) {
      throw new NotFoundError({
        code: 'AVAILABLE_PROVIDERS_NOT_FOUND',
      })
    }

    const modelProviders = filteredProviders.map((item) => {
      return {
        modelId: modelId,
        name: item.provider_name,
        context_length: item.context_length,
        maxOutput: item.max_completion_tokens || 0,
        lastLatency: item.stats?.p50_latency || 0,
        lastThroughput: item.stats?.p50_throughput || 0,
        inputPrice: (+item.pricing.prompt * 1.5) / 0.000002,
        imagePrice: (+item.pricing.image * 1.5) / 1_000 / 0.000002,
        outputPrice: (+item.pricing.completion * 1.5) / 0.000002,
        discount: 1,
        stats: [
          {
            date: new Date(item.model.updated_at),
            throughput: item.stats?.p50_throughput ?? 0,
            latency: item.stats?.p50_latency ?? 0,
            request_count: item.stats?.request_count ?? 0,
          },
        ],
      }
    })

    return modelProviders
  }
}
