import { UseCaseParams } from '@/domain/usecase/types'
import { IModel } from '@/domain/entity/model'
import { Prisma, Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type Update = (p: {
  userId: string
  modelId: string
  order?: number
  label?: string | null
  description?: string | null
  features?: string[]
  contextLength?: number
  maxTokens?: number
  pricing?: Prisma.InputJsonValue
  providerId?: string | null
  childProviderId?: string | null
  autoUpdatePricing?: boolean
}) => Promise<IModel | never>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({
    userId,
    modelId,
    order,
    label,
    description,
    features,
    contextLength,
    maxTokens,
    pricing,
    providerId,
    childProviderId,
    autoUpdatePricing
  }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    if (order) {
      const model = await adapter.modelRepository.get({
        where: {
          id: modelId
        }
      })
      const orderModel = await adapter.modelRepository.get({
        where: {
          parent_id: model?.parent_id ?? null,
          order
        }
      })

      if (model && orderModel) {
        await adapter.modelRepository.update({
          where: {
            id: orderModel.id
          },
          data: {
            order: model.order
          }
        })
      }
    }

    const model = await adapter.modelRepository.update({
      where: {
        id: modelId
      },
      data: {
        order,
        label,
        description,
        features,
        context_length: contextLength,
        max_tokens: maxTokens,
        pricing,
        provider_id: providerId,
        child_provider_id: childProviderId,
        auto_update_pricing: autoUpdatePricing
      }
    })

    if (order) {
      const models = await adapter.modelRepository.list({
        where: {
          parent_id: model.parent_id
        },
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true
        }
      })

      await Promise.all(
        models.map(({ id }, index) =>
          adapter.modelRepository.update({
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

    return model
  }
}
