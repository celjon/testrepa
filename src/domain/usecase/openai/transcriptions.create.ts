import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/domain/errors'
import { Readable } from 'stream'
import { Platform } from '@prisma/client'

export type TranscriptionsCreate = (p: {
  userId: string
  params: {
    model: string
    file: Readable
    fileName: string
    language?: string
    prompt?: string
    response_format?: 'text' | 'json' | 'srt' | 'verbose_json' | 'vtt'
    temperature?: number
    timestamp_granularities?: ('word' | 'segment')[]
  }
}) => Promise<unknown>

export const buildTranscriptionsCreate = ({ adapter, service }: UseCaseParams): TranscriptionsCreate => {
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

    const user = await adapter.userRepository.get({
      where: {
        id: userId
      },
      include: {
        employees: {
          include: {
            enterprise: true
          }
        }
      }
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const subscription = await service.user.getActualSubscription(user)

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

    const { response, audioMetadata } = await adapter.openaiGateway.raw.transcriptions.create(params)

    const caps = await service.model.getCaps({
      model,
      audioMetadata
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription,
      amount: caps,
      meta: {
        userId: user.id,
        platform: Platform.API_TRANSCRIPTIONS,
        model_id: model.id
      }
    })

    return response
  }
}
