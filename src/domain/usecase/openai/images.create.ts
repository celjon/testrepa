import { Platform } from '@prisma/client'
import { config } from '@/config'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { ImageLLMPricingParams } from '@/domain/service/model/pricing-schemas'

export type ImagesCreate = (p: {
  userId: string
  params: {
    model: string
    messages: Array<{
      role: 'user'
      content:
        | string
        | Array<
            | {
                type: 'text'
                text: string
              }
            | {
                type: 'image_url'
                image_url: {
                  url: string
                }
              }
          >
    }>
    [key: string]: unknown
  }
  developerKeyId?: string
}) => Promise<unknown>

export const buildImagesCreate = ({ adapter, service }: UseCaseParams): ImagesCreate => {
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

    await service.subscription.checkBalance({ subscription, estimate: 0 })

    const { hasAccess, reasonCode } = await service.plan.hasAccess(
      subscription!.plan!,
      params.model,
    )

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
      })
    }

    const result = await adapter.openaiGateway.raw.images.create(params)
    const caps = await service.model.getCaps.image({
      model,
      params,
      usage: result.response.usage
        ? ({
            input_text_tokens: result.response.usage.input_tokens_details.text_tokens,
            input_image_tokens: result.response.usage.input_tokens_details.image_tokens,
            output_image_tokens: result.response.usage.output_tokens,
          } satisfies ImageLLMPricingParams)
        : undefined,
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription: subscription!,
      amount: caps,
      meta: {
        userId: userId,
        platform: Platform.API_IMAGES,
        model_id: model.id,
        provider_id: config.model_providers.openai.id,
        developerKeyId,
      },
    })

    return result.response
  }
}
