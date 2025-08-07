import { Platform } from '@prisma/client'
import { config } from '@/config'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

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
  developerKeyId?: string
}) => Promise<unknown>

export const buildEmbeddingsCreate = ({ adapter, service }: UseCaseParams): EmbeddingsCreate => {
  return async ({ userId, params, developerKeyId }) => {
    const model = await adapter.modelRepository.get({
      where: {
        id: params.model,
      },
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    const caps = await service.model.getCaps.embeddings({
      model,
      params,
    })

    //estimate
    await service.subscription.checkBalance({ subscription, estimate: caps })

    const { hasAccess, reasonCode } = await service.plan.hasAccess(
      subscription!.plan!,
      params.model,
    )

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
      })
    }

    const result = await adapter.openaiGateway.raw.embeddings.create(params)

    await service.subscription.writeOffWithLimitNotification({
      subscription: subscription!,
      amount: caps,
      meta: {
        userId: userId,
        platform: Platform.API_EMBEDDINGS,
        model_id: model.id,
        provider_id: config.model_providers.openai.id,
        developerKeyId,
      },
    })

    return result.response
  }
}
