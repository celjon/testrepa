import { IModel } from '@/domain/entity/model'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type GetDefaultProvider = (params: {
  model: IModel
  excludedProviders?: string[]
}) => Promise<{
  id: string
} | null>

export const buildGetDefaultProvider =
  ({ modelProviderRepository }: Params): GetDefaultProvider =>
  async ({ model, excludedProviders }) => {
    const modelProviders = await modelProviderRepository.list({
      where: {
        ...(excludedProviders?.length
          ? {
              id: { not: { in: excludedProviders } },
            }
          : {}),
        parent_id: null,
        disabled: {
          not: true,
        },
        models: {
          some: {
            id: model.id,
          },
        },
      },
      select: {
        id: true,
      },
    })

    if (modelProviders.length === 0) {
      return null
    }
    if (!model.provider_id) {
      return modelProviders[0]
    }

    const defaultModelProvider =
      modelProviders.find(({ id }) => id === model.provider_id) ?? modelProviders[0] ?? null

    return defaultModelProvider
  }
