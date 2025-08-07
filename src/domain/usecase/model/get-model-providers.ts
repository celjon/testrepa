import { NotFoundError } from '@/domain/errors'
import { ModelProvider } from '@/domain/service/model/get-model-providers'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetModelProviders = (params: {
  id: string
  sort: string
  sortDirection: string
}) => Promise<ModelProvider[]>

export const buildGetModelProviders =
  ({ service, adapter }: UseCaseParams): GetModelProviders =>
  async ({ id, sort, sortDirection }) => {
    const model = await adapter.modelRepository.get({
      where: {
        id,
      },
    })
    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    const modelProviders = await service.model.getModelProviders({
      author: model.prefix.slice(0, -1),
      modelId: model.id,
    })

    const sortedModelProviders = [...modelProviders].sort((a, b) => {
      const valueA = a[sort as keyof typeof a]
      const valueB = b[sort as keyof typeof b]

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

    return sortedModelProviders
  }
