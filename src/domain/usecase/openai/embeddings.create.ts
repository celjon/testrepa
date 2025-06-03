import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { Platform } from '@prisma/client'

// https://platform.openai.com/docs/api-reference/embeddings
export type EmbeddingsCreate = (p: {
  userId: string
  params: {
    model: 'text-embedding-3-small' | 'text-embedding-ada-002' | 'text-embedding-3-large'
    input: string | Array<string> | Array<number> | Array<Array<number>>
    dimensions?: number
    response_format?: 'float' | 'base64'
    encoding_format?: 'float' | 'base64'
    endUserId: string
  }
}) => Promise<unknown>

export const buildEmbeddingsCreate = ({ adapter, service }: UseCaseParams): EmbeddingsCreate => {
  return async ({ userId, params }) => {
    const model = await adapter.modelRepository.get({
      where: {
        id: params.model
      }
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || subscription.balance <= 0 || !subscription.plan) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS'
      })
    }

    const { hasAccess, reasonCode } = await service.plan.hasAccess(subscription.plan, params.model)

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN'
      })
    }

    const result = await adapter.openaiGateway.raw.embeddings.create(params)

    const caps = await service.model.getCaps({
      model,
      params
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription,
      amount: caps,
      meta: {
        userId: userId,
        platform: Platform.API_EMBEDDINGS,
        model_id: model.id
      }
    })

    return result.response
  }
}
