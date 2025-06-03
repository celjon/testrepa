import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { Platform } from '@prisma/client'

export type SpeechCreate = (p: {
  userId: string
  params: {
    model: 'tts-1' | 'tts-1-hd'
    input: string
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
    speed?: number
  }
}) => Promise<unknown>

export const buildSpeechCreate = ({ adapter, service }: UseCaseParams): SpeechCreate => {
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

    if (!subscription || (subscription && subscription.balance <= 0) || !subscription.plan) {
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

    const result = await adapter.openaiGateway.raw.speech.create(params)
    const caps = await service.model.getCaps({
      model,
      params
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription,
      amount: caps,
      meta: {
        userId,
        platform: Platform.API_SPEECH,
        model_id: model.id
      }
    })

    return result.response
  }
}
