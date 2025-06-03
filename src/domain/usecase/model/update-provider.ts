import { IModelProvider } from '@/domain/entity/modelProvider'
import { UseCaseParams } from '@/domain/usecase/types'

export type UpdateProvider = (params: {
  id: string
  order?: number
  disabled?: boolean
  fallbackId?: string
}) => Promise<IModelProvider | null>

export const buildUpdateProvider =
  ({ adapter }: UseCaseParams): UpdateProvider =>
  async ({ id, order, disabled, fallbackId }) => {
    if (order) {
      const provider = await adapter.modelProviderRepository.get({
        where: {
          id
        }
      })
      const orderProvider = await adapter.modelProviderRepository.get({
        where: {
          parent_id: null,
          order
        }
      })

      if (provider && orderProvider) {
        await adapter.modelProviderRepository.update({
          where: {
            id: orderProvider.id
          },
          data: {
            order: provider.order
          }
        })
      }
    }

    const provider = await adapter.modelProviderRepository.update({
      where: {
        id
      },
      data: {
        order,
        disabled,
        fallback_id: fallbackId
      }
    })

    if (order) {
      const providers = await adapter.modelProviderRepository.list({
        where: {
          parent_id: null
        },
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true
        }
      })

      await Promise.all(
        providers.map(({ id }, index) =>
          adapter.modelProviderRepository.update({
            where: {
              id
            },
            data: {
              order: index + 1
            }
          })
        )
      )
    }

    return provider
  }
