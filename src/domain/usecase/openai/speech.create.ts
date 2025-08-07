import { Platform } from '@prisma/client'
import { config } from '@/config'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type SpeechCreate = (p: {
  userId: string
  params: {
    model: 'tts-1' | 'tts-1-hd'
    input: string
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
    speed?: number
  }
  developerKeyId?: string
}) => Promise<unknown>

export const buildSpeechCreate = ({ adapter, service }: UseCaseParams): SpeechCreate => {
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

    const caps = await service.model.getCaps.textToSpeech({
      model,
      params,
    })
    //estimate
    await service.subscription.checkBalance({
      subscription,
      estimate: caps,
    })

    const { hasAccess, reasonCode } = await service.plan.hasAccess(
      subscription!.plan!,
      params.model,
    )

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
      })
    }

    const result = await adapter.openaiGateway.raw.speech.create(params)

    await service.subscription.writeOffWithLimitNotification({
      subscription: subscription!,
      amount: caps,
      meta: {
        userId,
        platform: Platform.API_SPEECH,
        model_id: model.id,
        provider_id: config.model_providers.openai.id,
        developerKeyId,
      },
    })

    return result.response
  }
}
