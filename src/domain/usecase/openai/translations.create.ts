import { Readable } from 'stream'
import { Platform } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/domain/errors'

export type TranslationsCreate = (p: {
  userId: string
  params: {
    model: string
    file: Readable
    fileName: string
    prompt?: string
    responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
    temperature?: number
  }
}) => Promise<unknown>

export const buildTranslationsCreate = ({ adapter, service }: UseCaseParams): TranslationsCreate => {
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

    const { response, audioMetadata } = await adapter.openaiGateway.raw.translations.create(params)

    const caps = await service.model.getCaps({
      model,
      audioMetadata
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription,
      amount: caps,
      meta: {
        userId: user.id,
        platform: Platform.API_TRANSLATIONS,
        model_id: model.id
      }
    })

    return response
  }
}
