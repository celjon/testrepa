import { Readable } from 'stream'
import { Platform } from '@prisma/client'
import { config } from '@/config'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { getAudioDuration } from '@/lib/utils'

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
  developerKeyId?: string
}) => Promise<unknown>

export const buildTranslationsCreate = ({
  adapter,
  service,
}: UseCaseParams): TranslationsCreate => {
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

    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
      include: {
        employees: {
          include: {
            enterprise: true,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const subscription = await service.user.getActualSubscription(user)

    //estimate
    await service.subscription.checkBalance({
      subscription,
      estimate: await service.model.getCaps.speechToText({
        model,
        audioMetadata: { duration: await getAudioDuration(params.file) },
      }),
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

    const { response, audioMetadata } = await adapter.openaiGateway.raw.translations.create(params)

    const caps = await service.model.getCaps.speechToText({
      model,
      audioMetadata,
    })

    await service.subscription.writeOffWithLimitNotification({
      subscription: subscription!,
      amount: caps,
      meta: {
        userId: user.id,
        platform: Platform.API_TRANSLATIONS,
        model_id: model.id,
        provider_id: config.model_providers.openai.id,
        developerKeyId,
      },
    })

    return response
  }
}
